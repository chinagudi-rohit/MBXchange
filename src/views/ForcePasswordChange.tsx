import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Button, Field, TextInput, MercedesStar } from '../components/ui';

/**
 * Full-screen gate for accounts still on an admin-issued temporary password.
 *
 * Nothing else in the app renders until the password is replaced. On success
 * the session is deliberately torn down so the person signs in again with the
 * credential they chose — the temporary one is never left usable in a live
 * session.
 */
export function ForcePasswordChange() {
  const s = useStore();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < 8) { setError('Your new password must be at least 8 characters.'); return; }
    if (next !== confirm) { setError('The two new passwords do not match.'); return; }
    if (next === current) { setError('Choose a password different from the temporary one.'); return; }

    setBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next });
      setDone(true);
      // Brief confirmation, then drop the session so they sign in fresh.
      setTimeout(() => s.logout(), 1600);
    } catch (err: any) {
      setError(err?.message || 'Could not change the password.');
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="bg-mesh" />
        <div className="w-full max-w-sm panel rounded-2xl shadow-card p-7 text-center anim-pop-in">
          <span className="w-12 h-12 rounded-2xl bg-green-soft text-green flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <h1 className="text-lg font-semibold text-ink mt-4">Password updated</h1>
          <p className="text-sm text-ink-2 mt-1.5">
            Signing you out so you can log in with your new password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10">
      <div className="bg-mesh" />
      <div className="w-full max-w-sm anim-fade-up">
        <div className="flex items-center gap-3 mb-7 justify-center">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black shadow-card overflow-hidden" aria-hidden="true">
            <MercedesStar className="w-[82%] h-[82%]" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-medium text-ink tracking-tight">
              MB<span className="text-primary-text">X</span>change
            </p>
            <p className="text-xs text-ink-3 font-medium">Set your own password</p>
          </div>
        </div>

        <div className="panel rounded-2xl shadow-card p-6">
          <span className="w-10 h-10 rounded-2xl bg-amber-soft text-amber flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </span>
          <h1 className="text-lg font-semibold text-ink mt-3.5">Choose a new password</h1>
          <p className="text-sm text-ink-2 mt-1.5 leading-relaxed">
            You are signed in with a temporary password issued by your administrator.
            Replace it now to finish setting up your account.
          </p>

          <form onSubmit={submit} className="space-y-4 mt-5">
            <Field label="Temporary password" required>
              <TextInput
                type="password" autoComplete="current-password" required
                value={current} onChange={(e) => setCurrent(e.target.value)}
                placeholder="The one you were given"
              />
            </Field>

            <Field label="New password" required hint="At least 8 characters">
              <div className="relative">
                <TextInput
                  type={show ? 'text' : 'password'} autoComplete="new-password" required
                  value={next} onChange={(e) => setNext(e.target.value)}
                  placeholder="••••••••" className="pr-10"
                />
                <button
                  type="button" onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm new password" required>
              <TextInput
                type={show ? 'text' : 'password'} autoComplete="new-password" required
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p role="alert" className="text-xs font-semibold text-red bg-red-soft rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Updating…' : 'Set password and continue'}
            </Button>
          </form>
        </div>

        <button
          onClick={() => s.logout()}
          className="w-full text-center text-xs font-medium text-ink-3 hover:text-ink mt-4"
        >
          Sign out instead
        </button>
      </div>
    </div>
  );
}
