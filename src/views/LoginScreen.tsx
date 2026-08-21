import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button, Field, TextInput, MercedesStar } from '../components/ui';

const DEMO_ACCOUNTS = [
  { label: 'Admin — Dr. Markus Becker', email: 'markus.becker@mercedes-benz.com', password: 'MBXAdmin@2026' },
  { label: 'Manager — Elena Rostova', email: 'elena.rostova@mercedes-benz.com', password: 'Mbx@2026' },
  { label: 'Manager — Dr. Johannes Brandner', email: 'johannes.brandner@mercedes-benz.com', password: 'Mbx@2026' },
  { label: 'Employee — Rakesh Kumar', email: 'rakesh.kumar@mercedes-benz.com', password: 'Mbx@2026' },
  { label: 'Employee — Priya Sharma', email: 'priya.sharma@mercedes-benz.com', password: 'Mbx@2026' },
  { label: 'Employee (no manager) — Nikhil Verma', email: 'nikhil.verma@mercedes-benz.com', password: 'Mbx@2026' }
];

export function LoginScreen() {
  const s = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

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
    <div className="min-h-dvh grid lg:grid-cols-[1.1fr_minmax(26rem,0.9fr)]">
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
              'Apply for yourself or nominate colleagues',
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
            <span>Demo seed accounts (pilot environment)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${demoOpen ? 'rotate-180' : ''}`} />
          </button>
          {demoOpen && (
            <div className="px-3 pb-3 space-y-1">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => { setEmail(a.email); setPassword(a.password); setError(''); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-2 transition-colors"
                >
                  <span className="block text-xs font-semibold text-ink">{a.label}</span>
                  <span className="block text-xs text-ink-3">{a.email}</span>
                </button>
              ))}
              <p className="px-3 pt-1.5 text-xs text-ink-3">
                Seeded for testing — remove before production rollout.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
