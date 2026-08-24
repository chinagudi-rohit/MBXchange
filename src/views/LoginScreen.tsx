import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Button, Field, TextInput, MercedesStar, Avatar } from '../components/ui';

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  systemRole: 'employee' | 'manager' | 'admin';
  department: string;
  initials: string;
  mustChangePassword: boolean;
  managerName: string | null;
}

export function LoginScreen() {
  const s = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [accounts, setAccounts] = useState<DemoAccount[] | null>(null);
  const [defaults, setDefaults] = useState<{ admin: string; user: string }>({ admin: '', user: '' });
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Pulled live so the picker reflects whoever exists right now — accounts the
  // admin adds or deactivates show up without touching this file.
  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const d = await api.get('/auth/demo-accounts');
      setAccounts(d.accounts || []);
      setDefaults(d.defaultPasswords || { admin: '', user: '' });
    } catch {
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => { if (demoOpen && accounts === null) loadAccounts(); }, [demoOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await s.login(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[1.1fr_minmax(26rem,0.9fr)]">
      {/* Brand panel — fills the left half instead of leaving the screen empty */}
      <aside className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-black text-white">
        <div className="flex items-center gap-3">
          <MercedesStar className="w-11 h-11" />
          <span className="text-lg font-semibold tracking-tight">
            MB<span className="text-[#d97757]">X</span>change
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl xl:text-4xl font-semibold leading-tight">
            Projects beyond your day-to-day work.
          </h2>
          <p className="text-sm text-white/70 mt-4 leading-relaxed">
            Find help across departments, lend your skills where they are needed, and keep
            every request moving through the right approvals — in one place.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              'Post a requirement and get matched with the right people',
              'Apply to opportunities that match your declared skills',
              'Capacity-aware approvals routed to the right manager'
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-white/85">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#d97757] shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/45">
          Mercedes-Benz internal platform · Access provisioned by your administrator
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-sm anim-fade-up">
        <div className="flex items-center gap-3 mb-8 justify-center lg:hidden">
          <span
            className="w-14 h-14 rounded-2xl relative flex items-center justify-center bg-black shadow-card overflow-hidden"
            aria-hidden="true"
          >
            <MercedesStar className="w-[82%] h-[82%]" />
          </span>
          <div className="leading-tight">
            <p className="text-xl font-medium text-ink tracking-tight">
              MB<span className="text-primary-text">X</span>change
            </p>
            <p className="text-xs text-ink-3 font-medium">Mercedes-Benz · Cross-Department Project Exchange</p>
          </div>
        </div>

        <div className="panel rounded-2xl shadow-card p-6">
          <h1 className="hidden lg:block text-xl font-semibold text-ink mb-1">Welcome back</h1>
          <h1 className="lg:hidden text-base font-semibold text-ink mb-1">Sign in</h1>
          <p className="text-xs text-ink-2 mb-5">
            Accounts are created by your MBXchange administrator.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Corporate Email" required>
              <TextInput
                type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@mercedes-benz.com"
              />
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <TextInput
                  type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="text-xs font-semibold text-red bg-red-soft rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="mt-4 panel rounded-2xl shadow-card overflow-hidden">
          <button
            onClick={() => setDemoOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-ink-2 hover:bg-surface-2"
            aria-expanded={demoOpen}
          >
            <span>Sign in as any user (pilot environment){accounts ? ` · ${accounts.length}` : ''}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${demoOpen ? 'rotate-180' : ''}`} />
          </button>
          {demoOpen && (
            <div className="px-3 pb-3">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs text-ink-3">Live list — updates as accounts change</span>
                <button
                  onClick={loadAccounts}
                  aria-label="Refresh account list"
                  className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAccounts ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {accounts === null ? (
                <p className="px-3 py-4 text-xs text-ink-3">Loading accounts…</p>
              ) : accounts.length === 0 ? (
                <p className="px-3 py-4 text-xs text-ink-3">
                  Account list unavailable. Sign in with your email and password above.
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {accounts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setEmail(a.email);
                        setPassword(a.systemRole === 'admin' ? defaults.admin : defaults.user);
                        setError('');
                      }}
                      className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-xl hover:bg-surface-2 transition-colors"
                    >
                      <Avatar initials={a.initials} size="sm" name={a.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-ink truncate">
                          {a.name}
                          {a.mustChangePassword && (
                            <span className="ml-1.5 font-medium text-amber">· temp password</span>
                          )}
                        </span>
                        <span className="block text-xs text-ink-3 truncate">
                          {a.systemRole} · {a.department}
                          {a.systemRole === 'employee' && !a.managerName && ' · no manager'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <p className="px-3 pt-2.5 text-xs text-ink-3">
                Fills in the seed password. Accounts created by an admin keep their
                one-time password until it is changed — type that one in manually.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
