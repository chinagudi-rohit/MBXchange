import React, { useEffect, useMemo, useState } from 'react';
import { Award, Plus, Pencil, Trash2, Sliders, Layers } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, type BadgeDef, type TierDef, type TierSettings } from '../lib/api';
import {
  Card, Button, Chip, Modal, Field, TextInput, TextArea, Select, RowSkeleton
} from '../components/ui';
import { TIER_ARTIFACTS } from '../components/tierArtifacts';

const TierCrystal3D = React.lazy(() =>
  import('../components/TierCrystal3D').then((m) => ({ default: m.TierCrystal3D }))
);

const EMPTY_BADGE = {
  id: '', name: '', icon: '🏅', description: '',
  dimension: 'collaboration', criteria: '', active: true, sortOrder: 0
};
const EMPTY_TIER = {
  id: '', name: '', artifact: 'octahedron', icon: '◇', blurb: '',
  minPoints: 0, sortOrder: 0, active: true
};

/**
 * Administration for the recognition system: the badge vocabulary, the tier
 * ladder, and the weighting that decides which tier somebody sits in.
 *
 * The weighting editor previews before it saves — changing a weight
 * re-tiers the whole organisation, so seeing what it does to a few sample
 * profiles first is the difference between a considered change and a
 * surprise.
 */
export function RecognitionAdmin() {
  const s = useStore();
  const [badges, setBadges] = useState<BadgeDef[] | null>(null);
  const [tiers, setTiers] = useState<TierDef[] | null>(null);
  const [dimensions, setDimensions] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<TierSettings | null>(null);
  const [draft, setDraft] = useState<TierSettings | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const [badgeForm, setBadgeForm] = useState<typeof EMPTY_BADGE | null>(null);
  const [badgeIsNew, setBadgeIsNew] = useState(true);
  const [tierForm, setTierForm] = useState<typeof EMPTY_TIER | null>(null);
  const [tierIsNew, setTierIsNew] = useState(true);

  const load = async () => {
    const [b, cfg] = await Promise.all([
      api.get('/admin/badges'),
      api.get('/recognition/config')
    ]);
    setBadges(b.badges);
    setDimensions(b.dimensions);
    setTiers(cfg.tiers);
    setSettings(cfg.settings);
    setDraft(cfg.settings);
  };
  useEffect(() => { load(); }, []);

  // Sample profiles the weighting preview is run against.
  const SAMPLES = useMemo(() => ([
    { label: 'New joiner', hours: 8, contributions: 1 },
    { label: 'Occasional helper', hours: 40, contributions: 6 },
    { label: 'Regular contributor', hours: 120, contributions: 15 },
    { label: 'Highly active', hours: 240, contributions: 30 }
  ]), []);

  useEffect(() => {
    if (!draft) return;
    const t = setTimeout(() => {
      api.post('/admin/recognition/preview', { ...draft, samples: SAMPLES })
        .then((d) => setPreview(d.rows))
        .catch(() => { /* preview only */ });
    }, 200);
    return () => clearTimeout(t);
  }, [draft, SAMPLES]);

  const dirty = !!draft && !!settings && JSON.stringify(draft) !== JSON.stringify(settings);

  const saveSettings = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      await api.patch('/admin/recognition/settings', draft);
      s.toast('success', 'Weighting saved', 'Everyone has been re-evaluated against the new formula.');
      await Promise.all([load(), s.loadUsers(), s.loadTiers()]);
    } catch (e: any) {
      s.toast('error', 'Could not save', e.message);
    } finally { setBusy(false); }
  };

  const saveBadge = async () => {
    if (!badgeForm) return;
    setBusy(true);
    try {
      if (badgeIsNew) await api.post('/admin/badges', badgeForm);
      else await api.patch(`/admin/badges/${badgeForm.id}`, badgeForm);
      s.toast('success', badgeIsNew ? 'Badge added' : 'Badge updated');
      setBadgeForm(null);
      await load();
    } catch (e: any) {
      s.toast('error', 'Could not save', e.message);
    } finally { setBusy(false); }
  };

  const removeBadge = async (b: BadgeDef) => {
    try {
      const r = await api.del(`/admin/badges/${b.id}`);
      s.toast('info', r.retired ? 'Badge retired' : 'Badge deleted',
        r.retired
          ? `${r.awardsHeld} ${r.awardsHeld === 1 ? 'person holds' : 'people hold'} this, so it was hidden rather than deleted.`
          : 'Nobody held it, so it is gone.');
      await load();
    } catch (e: any) { s.toast('error', 'Could not remove', e.message); }
  };

  const saveTier = async () => {
    if (!tierForm) return;
    setBusy(true);
    try {
      if (tierIsNew) await api.post('/admin/tiers', tierForm);
      else await api.patch(`/admin/tiers/${tierForm.id}`, tierForm);
      s.toast('success', tierIsNew ? 'Tier added' : 'Tier updated', 'Everyone has been re-evaluated.');
      setTierForm(null);
      await Promise.all([load(), s.loadUsers(), s.loadTiers()]);
    } catch (e: any) {
      s.toast('error', 'Could not save', e.message);
    } finally { setBusy(false); }
  };

  const removeTier = async (t: TierDef) => {
    try {
      await api.del(`/admin/tiers/${t.id}`);
      s.toast('info', 'Tier removed', 'Everyone has been re-evaluated.');
      await Promise.all([load(), s.loadUsers(), s.loadTiers()]);
    } catch (e: any) { s.toast('error', 'Could not remove', e.message); }
  };

  if (!badges || !tiers || !draft) return <RowSkeleton count={6} />;

  const ladder = [...tiers].sort((a, b) => a.minPoints - b.minPoints);

  return (
    <div className="space-y-8">
      {/* ── Tier weighting ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-ink flex items-center gap-1.5 mb-1">
          <Sliders className="w-4 h-4 text-primary-text" /> How tiers are calculated
        </h2>
        <p className="text-xs text-ink-2 mb-3">
          Hours given and number of contributions are weighted separately, each capped at
          its own target, to produce a score out of 100. Tiers are thresholds on that score.
        </p>

        <Card className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hours weight" hint="Relative importance">
                  <TextInput
                    type="number" step="0.05" min={0} max={1} value={draft.hoursWeight}
                    onChange={(e) => setDraft({ ...draft, hoursWeight: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Contributions weight">
                  <TextInput
                    type="number" step="0.05" min={0} max={1} value={draft.contributionsWeight}
                    onChange={(e) => setDraft({ ...draft, contributionsWeight: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Hours target" hint="Counts as fully there">
                  <TextInput
                    type="number" min={1} value={draft.hoursTarget}
                    onChange={(e) => setDraft({ ...draft, hoursTarget: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Contributions target">
                  <TextInput
                    type="number" min={1} value={draft.contributionsTarget}
                    onChange={(e) => setDraft({ ...draft, contributionsTarget: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <p className="text-xs text-ink-3 leading-relaxed">
                Weights are normalised, so they need not add up to 1.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveSettings} disabled={!dirty || busy}>
                  {busy ? 'Saving…' : 'Save weighting'}
                </Button>
                {dirty && (
                  <Button size="sm" variant="secondary" onClick={() => setDraft(settings)}>Reset</Button>
                )}
              </div>
            </div>

            {/* Preview before commit — saving re-tiers the whole org. */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">
                What this would mean
              </p>
              <div className="space-y-1.5">
                {preview.map((r) => (
                  <div key={r.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2">
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-ink truncate">{r.label}</span>
                      <span className="block text-xs text-ink-3">{r.hours}h · {r.contributions} contributions</span>
                    </span>
                    <span className="text-xs font-semibold text-ink tabular-nums shrink-0">{r.points.toFixed(1)}</span>
                    <Chip tone="primary">{r.tier}</Chip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Tier ladder ────────────────────────────────────────────────── */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-semibold text-ink flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber" /> Tier ladder ({ladder.length})
            </h2>
            <p className="text-xs text-ink-2 mt-0.5">Name, threshold and 3D artifact for each rung.</p>
          </div>
          <Button size="sm" onClick={() => { setTierForm({ ...EMPTY_TIER }); setTierIsNew(true); }}>
            <Plus className="w-3.5 h-3.5" /> Add tier
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {ladder.map((t) => (
            <Card key={t.id} className={`p-5 ${t.active ? '' : 'opacity-60'}`}>
              <div className="flex items-start gap-3.5">
                <span className="w-14 h-14 rounded-2xl bg-amber-soft text-amber flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  <React.Suspense fallback={<span>{t.icon}</span>}>
                    <TierCrystal3D artifact={t.artifact} className="w-full h-full" fallback={<span>{t.icon}</span>} />
                  </React.Suspense>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-ink leading-tight">{t.name}</p>
                  <p className="text-xs text-ink-3 mt-0.5">
                    from <b className="text-ink-2 tabular-nums">{t.minPoints}</b> pts · {t.artifact}
                    {!t.active && ' · hidden'}
                  </p>
                  {t.blurb && <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">{t.blurb}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3.5">
                <Button size="sm" variant="secondary"
                  onClick={() => { setTierForm({ ...EMPTY_TIER, ...t }); setTierIsNew(false); }}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => removeTier(t)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Badge vocabulary ───────────────────────────────────────────── */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-semibold text-ink flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber" /> Badges ({badges.filter((b) => b.active).length} active)
            </h2>
            <p className="text-xs text-ink-2 mt-0.5">
              Keep the list short — a long one makes choosing a chore and spreads the counts too thin.
            </p>
          </div>
          <Button size="sm" onClick={() => { setBadgeForm({ ...EMPTY_BADGE }); setBadgeIsNew(true); }}>
            <Plus className="w-3.5 h-3.5" /> Add badge
          </Button>
        </div>

        {Object.entries(dimensions).map(([dim, label]) => {
          const inDim = badges.filter((b) => b.dimension === dim);
          if (inDim.length === 0) return null;
          return (
            <div key={dim} className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">{label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {inDim.map((b) => (
                  <Card key={b.id} className={`p-4 ${b.active ? '' : 'opacity-55'}`}>
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-amber-soft flex items-center justify-center text-lg shrink-0" aria-hidden="true">
                        {b.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                          {b.name}
                          {!b.active && <Chip>retired</Chip>}
                        </p>
                        <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">{b.description}</p>
                        {b.criteria && (
                          <p className="text-xs text-ink-3 mt-1.5 leading-relaxed bg-surface-2 rounded-lg px-2.5 py-1.5">
                            {b.criteria}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button size="sm" variant="secondary"
                        onClick={() => { setBadgeForm({ ...EMPTY_BADGE, ...b }); setBadgeIsNew(false); }}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => removeBadge(b)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Badge editor ───────────────────────────────────────────────── */}
      <Modal
        open={!!badgeForm} onClose={() => setBadgeForm(null)}
        title={badgeIsNew ? 'Add a badge' : 'Edit badge'}
        subtitle={badgeIsNew ? 'It becomes available to award immediately' : badgeForm?.id}
        footer={
          <>
            <Button variant="secondary" onClick={() => setBadgeForm(null)}>Cancel</Button>
            <Button onClick={saveBadge} disabled={busy}>{busy ? 'Saving…' : 'Save badge'}</Button>
          </>
        }
      >
        {badgeForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-[5rem_1fr] gap-4">
              <Field label="Icon">
                <TextInput
                  value={badgeForm.icon} maxLength={4}
                  onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                  className="text-center text-lg"
                />
              </Field>
              <Field label="Name" required>
                <TextInput
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                  placeholder="e.g. Knowledge Multiplier"
                />
              </Field>
            </div>
            <Field label="Description" hint="Shown on the badge wherever it appears.">
              <TextArea
                rows={2} value={badgeForm.description}
                onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
              />
            </Field>
            <Field label="When to award it" hint="Guidance shown to whoever is choosing a badge.">
              <TextArea
                rows={2} value={badgeForm.criteria}
                onChange={(e) => setBadgeForm({ ...badgeForm, criteria: e.target.value })}
                placeholder="e.g. Use when a session or doc changed how the team works."
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Quality it belongs to" hint="Groups the badge on a profile.">
                <Select
                  value={badgeForm.dimension}
                  onChange={(e) => setBadgeForm({ ...badgeForm, dimension: e.target.value })}
                >
                  {Object.entries(dimensions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </Field>
              <Field label="Availability">
                <Select
                  value={badgeForm.active ? 'active' : 'retired'}
                  onChange={(e) => setBadgeForm({ ...badgeForm, active: e.target.value === 'active' })}
                >
                  <option value="active">Available to award</option>
                  <option value="retired">Retired — keeps existing awards</option>
                </Select>
              </Field>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Tier editor ────────────────────────────────────────────────── */}
      <Modal
        open={!!tierForm} onClose={() => setTierForm(null)}
        title={tierIsNew ? 'Add a tier' : 'Edit tier'}
        subtitle="Saving re-evaluates everyone against the ladder"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTierForm(null)}>Cancel</Button>
            <Button onClick={saveTier} disabled={busy}>{busy ? 'Saving…' : 'Save tier'}</Button>
          </>
        }
      >
        {tierForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-[5rem_1fr] gap-4">
              <Field label="Glyph" hint="Fallback">
                <TextInput
                  value={tierForm.icon} maxLength={3}
                  onChange={(e) => setTierForm({ ...tierForm, icon: e.target.value })}
                  className="text-center text-lg"
                />
              </Field>
              <Field label="Name" required>
                <TextInput
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  placeholder="e.g. Connector"
                />
              </Field>
            </div>

            <Field label="Reached at" hint="Points out of 100 from the weighting above.">
              <TextInput
                type="number" min={0} max={100} value={tierForm.minPoints}
                onChange={(e) => setTierForm({ ...tierForm, minPoints: Number(e.target.value) })}
              />
            </Field>

            <Field label="Description">
              <TextInput
                value={tierForm.blurb}
                onChange={(e) => setTierForm({ ...tierForm, blurb: e.target.value })}
                placeholder="What holding this tier says about someone"
              />
            </Field>

            <Field label="3D artifact" hint="Pick one — each rung should look distinct from its neighbours.">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-0.5">
                {TIER_ARTIFACTS.map((a) => {
                  const picked = tierForm.artifact === a.key;
                  return (
                    <button
                      key={a.key} type="button"
                      onClick={() => setTierForm({ ...tierForm, artifact: a.key })}
                      title={a.label}
                      className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        picked ? 'border-primary bg-primary-soft' : 'border-line bg-surface-2 hover:border-line-strong'
                      }`}
                    >
                      <span className="w-11 h-11 flex items-center justify-center">
                        <React.Suspense fallback={<span className="text-ink-3">◇</span>}>
                          <TierCrystal3D artifact={a.key} className="w-full h-full" />
                        </React.Suspense>
                      </span>
                      <span className={`text-xs font-medium text-center leading-tight ${picked ? 'text-primary-text' : 'text-ink-3'}`}>
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
