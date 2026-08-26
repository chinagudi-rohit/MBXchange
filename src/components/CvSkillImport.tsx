import React, { useRef, useState } from 'react';
import { FileUp, Check, Loader2, X } from 'lucide-react';
import { extractSkillsFromCv, CvParseError, type ExtractedSkill } from '../lib/cvSkills';

/**
 * Import skills from a CV instead of typing them one at a time.
 *
 * The reading and matching both happen in the browser (see lib/cvSkills), so
 * the CV never leaves the machine. Findings are presented as a reviewable set
 * rather than written straight onto the profile: a catalogue match is a good
 * first guess, not an authority on what somebody is actually good at.
 */
export function CvSkillImport({
  existing, onAdd
}: {
  existing: string[];
  onAdd: (skills: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [found, setFound] = useState<ExtractedSkill[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [fileName, setFileName] = useState('');

  const alreadyHave = new Set(existing.map((s) => s.toLowerCase()));

  const handleFile = async (file: File) => {
    setBusy(true);
    setError('');
    setFound(null);
    setFileName(file.name);
    try {
      const { skills } = await extractSkillsFromCv(file);
      const fresh = skills.filter((sk) => !alreadyHave.has(sk.name.toLowerCase()));
      setFound(fresh);
      // Pre-select everything found; unchecking a wrong guess is less work
      // than ticking twelve right ones.
      setPicked(new Set(fresh.map((sk) => sk.name)));
    } catch (err) {
      setError(err instanceof CvParseError ? err.message : 'That file could not be read.');
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    onAdd([...picked]);
    setFound(null);
    setPicked(new Set());
    setFileName('');
  };

  const toggle = (name: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="mt-2">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,.rtf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // Reset so re-picking the same file fires change again.
          e.target.value = '';
        }}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-line-strong text-xs font-semibold text-ink-2 hover:text-ink hover:border-primary hover:bg-primary-soft/40 transition-colors disabled:opacity-60"
      >
        {busy
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading {fileName}…</>
          : <><FileUp className="w-3.5 h-3.5" /> Import skills from my CV</>}
      </button>
      <p className="text-xs text-ink-3 mt-1.5 leading-relaxed">
        PDF, .docx or plain text. Your CV is read in your browser and never uploaded —
        it is matched against the skill catalogue, so review what it finds.
      </p>

      {error && (
        <p className="text-xs font-medium text-red bg-red-soft rounded-xl px-3 py-2.5 mt-2">{error}</p>
      )}

      {found && (
        <div className="mt-3 p-3.5 rounded-xl bg-surface-2">
          {found.length === 0 ? (
            <>
              <p className="text-xs font-semibold text-ink">Nothing new found</p>
              <p className="text-xs text-ink-2 mt-1 leading-relaxed">
                Every skill the catalogue recognised in {fileName} is already on your profile.
                Anything missing can be added by hand above.
              </p>
              <div className="flex justify-end mt-2.5">
                <button
                  type="button" onClick={() => { setFound(null); setFileName(''); }}
                  className="text-xs font-semibold text-ink-2 hover:text-ink"
                >Dismiss</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink">
                  Found {found.length} skill{found.length === 1 ? '' : 's'} in {fileName}
                </p>
                <button
                  type="button"
                  onClick={() => setPicked(picked.size === found.length ? new Set() : new Set(found.map((f) => f.name)))}
                  className="text-xs font-semibold text-primary-text hover:underline underline-offset-2 shrink-0"
                >
                  {picked.size === found.length ? 'Clear all' : 'Select all'}
                </button>
              </div>
              <p className="text-xs text-ink-3 mt-0.5 mb-2.5">
                Untick anything that is not really yours.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {found.map((sk) => {
                  const on = picked.has(sk.name);
                  return (
                    <button
                      key={sk.name}
                      type="button"
                      onClick={() => toggle(sk.name)}
                      title={`Matched on “${sk.matchedOn}” · ${sk.hits} mention${sk.hits === 1 ? '' : 's'}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        on
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface text-ink-2 border-line hover:border-line-strong'
                      }`}
                    >
                      {on ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-40" />}
                      {sk.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button" onClick={() => { setFound(null); setFileName(''); }}
                  className="text-xs font-semibold text-ink-2 hover:text-ink px-2 py-1.5"
                >Cancel</button>
                <button
                  type="button" onClick={confirm} disabled={picked.size === 0}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-strong disabled:opacity-40 transition-colors"
                >
                  Add {picked.size} skill{picked.size === 1 ? '' : 's'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
