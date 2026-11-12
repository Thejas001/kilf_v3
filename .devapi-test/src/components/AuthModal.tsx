'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { SmartLink } from './SmartLink';
import { Icon } from './Icon';
import { LimeButton } from './LimeButton';
import * as auth from '@/lib/auth';
import { PASSWORD_HINT, validPassword, type AuthRequest, type Guest } from '@/lib/auth';
import { useGuest } from '@/lib/useGuest';
import { localizePath, parsePath } from '@/i18n/ui';

type View = 'login' | 'register' | 'forgot' | 'reset';

const control =
  'block w-full rounded-none border border-line bg-white py-3.5 text-base text-navy placeholder:text-muted/70 transition-colors hover:border-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20 aria-[invalid=true]:border-coral-ink aria-[invalid=true]:ring-coral-ink/20';

const copy: Record<View, { eyebrow: string; title: string; lead: string }> = {
  login: { eyebrow: 'Guest login', title: 'Welcome back.', lead: 'Sign in to manage your passes and bookings.' },
  register: { eyebrow: 'New guest', title: 'Join the festival.', lead: 'Create an account to book passes for KILF 2027.' },
  forgot: { eyebrow: 'Reset password', title: 'Forgot it?', lead: 'Enter your email and we will send a reset link.' },
  reset: { eyebrow: 'Reset password', title: 'Choose a new one.', lead: 'Paste your reset token and set a new password.' },
};

function PasswordField({ label, name, value, onChange, autoComplete, hint, error }: {
  label: string; name: string; value: string; onChange: (v: string) => void; autoComplete: string; hint?: string; error?: string;
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-navy">{label}</label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-d`}
          className={`${control} pl-4 pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-navy"
        >
          <Icon name={show ? 'eye-off' : 'eye'} size={20} />
        </button>
      </div>
      <p id={`${id}-d`} className={`mt-1.5 text-[0.8rem] leading-snug ${error ? 'font-semibold text-coral-ink' : 'text-muted'}`}>{error || hint}</p>
    </div>
  );
}

function TextField({ label, name, type = 'text', value, onChange, autoComplete, error }: {
  label: string; name: string; type?: string; value: string; onChange: (v: string) => void; autoComplete?: string; error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-navy">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-d` : undefined}
        className={`${control} mt-1.5 px-4`}
      />
      {error && <p id={`${id}-d`} className="mt-1.5 text-[0.8rem] font-semibold leading-snug text-coral-ink">{error}</p>}
    </div>
  );
}

/**
 * The login popup, mounted once in the header (a native <dialog>: focus trap, Esc
 * and backdrop come for free). Anything can open it with openLogin() or
 * requireLogin() from lib/auth; on success it closes itself and reports the
 * guest through a `kilf:auth-result` event, so a booking in progress resumes
 * exactly where it was.
 */
export function AuthDialog() {
  const dlg = useRef<HTMLDialogElement>(null);
  const success = useRef<Guest | null>(null);
  const [view, setView] = useState<View>('login');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', token: '' });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const open = (e: Event) => {
      const d = (e as CustomEvent<AuthRequest | undefined>).detail;
      setReason(d?.reason ?? '');
      success.current = null;
      go(d?.view ?? 'login');
      if (!dlg.current?.open) {
        dlg.current?.showModal();
        document.documentElement.classList.add('overflow-hidden');
      }
    };
    window.addEventListener('kilf:auth', open);
    return () => window.removeEventListener('kilf:auth', open);
  }, []);

  function closeDialog() {
    if (!busy) dlg.current?.close();
  }
  function go(v: View) {
    setView(v);
    setFormError('');
    setErrors({});
    if (v !== 'reset') setNotice('');
    setF((p) => ({ ...p, password: '', confirm: '' }));
  }
  function signedIn(g: Guest) {
    success.current = g;
    setF({ name: '', email: '', password: '', confirm: '', token: '' });
    dlg.current?.close();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const er: Record<string, string> = {};
    const email = f.email.trim();
    if (view === 'register' && (f.name.trim().length < 2 || f.name.trim().length > 100)) er.name = 'Enter your name (2–100 characters).';
    if (view !== 'reset' && !/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email address.';
    if (view === 'login' && !f.password) er.password = 'Enter your password.';
    if ((view === 'register' || view === 'reset') && !validPassword(f.password)) er.password = PASSWORD_HINT;
    if ((view === 'register' || view === 'reset') && f.confirm !== f.password) er.confirm = 'Passwords do not match.';
    if (view === 'reset' && !f.token.trim()) er.token = 'Paste the reset token.';
    setErrors(er);
    setFormError('');
    if (Object.keys(er).length) return;

    setBusy(true);
    try {
      if (view === 'login') {
        signedIn(await auth.login(email, f.password));
      } else if (view === 'register') {
        signedIn(await auth.register({ name: f.name.trim(), email, password: f.password, confirmPassword: f.confirm }));
      } else if (view === 'forgot') {
        const token = await auth.forgotPassword(email);
        setF((p) => ({ ...p, token: token ?? '' }));
        setNotice(token ? 'Dev mode: your reset token is filled in below.' : 'If that email is registered, a reset link has been sent.');
        setView(token ? 'reset' : 'forgot');
      } else if (view === 'reset') {
        await auth.resetPassword(f.token.trim(), f.password, f.confirm);
        go('login');
        setNotice('Password reset. Sign in with your new password.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      // Registering an email that already has an account: point them at login instead of a dead end.
      if (view === 'register' && err instanceof auth.AuthError && err.status === 409) {
        go('login');
        setNotice('That email already has an account. Log in instead.');
      } else setFormError(msg);
    } finally {
      setBusy(false);
    }
  }

  const c = copy[view];

  return (
    <dialog
      ref={dlg}
      aria-labelledby="auth-title"
      onClose={() => {
        document.documentElement.classList.remove('overflow-hidden');
        window.dispatchEvent(new CustomEvent('kilf:auth-result', { detail: success.current }));
      }}
      onCancel={(e) => busy && e.preventDefault()}
      onClick={(e) => e.target === dlg.current && closeDialog()}
      className="auth-dialog m-auto w-[min(100vw-1.5rem,56rem)] max-h-[calc(100dvh-1.5rem)] overflow-hidden border-0 bg-transparent p-0 text-navy backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="grid max-h-[calc(100dvh-1.5rem)] md:grid-cols-[0.82fr_1fr]">
        {/* Brand panel */}
        <aside className="on-dark relative hidden flex-col justify-between overflow-hidden bg-footer p-9 text-white md:flex">
          <svg aria-hidden="true" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full opacity-60">
            <g fill="none" stroke="#b8c3f0" strokeOpacity=".28" strokeWidth="1.2">
              <path d="M-20 380C80 340 150 420 260 380S360 340 430 372" />
              <path d="M-20 430C90 390 160 470 270 430S370 390 430 422" />
              <path d="M-20 480C100 440 170 520 280 480S380 440 430 472" />
              <path d="M-20 530C110 490 180 570 290 530S390 490 430 522" />
            </g>
            <circle cx="300" cy="120" r="46" fill="#e7ef92" fillOpacity=".92" />
          </svg>
          <p className="eyebrow relative text-lime">KILF 2027</p>
          <div className="relative">
            <p className="display text-[2.1rem] text-white">Where Kollam&rsquo;s lake meets the written word.</p>
            <p className="mt-4 text-sm leading-relaxed text-mist">31 December 2026 – 4 January 2027<br />Kollam International Literature Festival</p>
          </div>
        </aside>

        {/* Form panel */}
        <div className="relative overflow-y-auto bg-cream p-6 sm:p-9">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="absolute right-3 top-3 grid size-11 place-items-center text-navy ring-1 ring-inset ring-navy/20 transition-colors hover:bg-navy/5"
          >
            <Icon name="close" size={20} />
          </button>

          {reason && (
            <p className="mb-5 mr-12 flex items-start gap-2.5 border-l-4 border-lime-deep bg-lime/40 px-4 py-3 text-sm font-semibold text-navy">
              <Icon name="lock" size={18} className="mt-0.5 shrink-0" />
              {reason}
            </p>
          )}

          <form onSubmit={submit} noValidate className="pr-0 pt-1">
            <p className="eyebrow text-blue">{c.eyebrow}</p>
            <h2 id="auth-title" className="display mt-2 pr-12 text-[2rem] text-navy sm:text-[2.35rem]">{c.title}</h2>
            <p className="mt-2 text-[0.95rem] text-muted">{c.lead}</p>

            {(notice || formError) && (
              <p role={formError ? 'alert' : 'status'} className={`mt-5 border-l-4 px-4 py-3 text-sm font-semibold ${formError ? 'border-coral-ink bg-coral-soft text-coral-deep' : 'border-blue bg-sky text-navy'}`}>
                {formError || notice}
              </p>
            )}

            <div className="mt-6 grid gap-4">
              {view === 'register' && <TextField label="Full name" name="name" value={f.name} onChange={set('name')} autoComplete="name" error={errors.name} />}
              {view !== 'reset' && <TextField label="Email" name="email" type="email" value={f.email} onChange={set('email')} autoComplete="email" error={errors.email} />}
              {view === 'reset' && <TextField label="Reset token" name="token" value={f.token} onChange={set('token')} autoComplete="off" error={errors.token} />}
              {view !== 'forgot' && (
                <PasswordField
                  label={view === 'login' ? 'Password' : 'New password'}
                  name="password"
                  value={f.password}
                  onChange={set('password')}
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  hint={view === 'login' ? undefined : PASSWORD_HINT}
                  error={errors.password}
                />
              )}
              {(view === 'register' || view === 'reset') && (
                <PasswordField label="Confirm password" name="confirmPassword" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" error={errors.confirm} />
              )}
            </div>

            {view === 'login' && (
              <button type="button" onClick={() => go('forgot')} className="mt-3 min-h-11 text-sm font-semibold text-blue underline-offset-4 hover:underline">
                Forgot password?
              </button>
            )}

            <LimeButton
              type="submit"
              size="lg"
              disabled={busy}
              className={`mt-4 w-full justify-between ${busy ? 'opacity-70' : ''}`}
              label={busy ? 'Please wait…' : { login: 'Log in', register: 'Create account', forgot: 'Send reset link', reset: 'Reset password' }[view]}
            />

            <p className="mt-5 text-center text-sm text-muted">
              {view === 'login' ? (
                <>New to KILF? <button type="button" onClick={() => go('register')} className="min-h-11 font-semibold text-blue underline-offset-4 hover:underline">Create an account</button></>
              ) : (
                <>{view === 'register' ? 'Already registered?' : 'Remembered it?'} <button type="button" onClick={() => go('login')} className="min-h-11 font-semibold text-blue underline-offset-4 hover:underline">Log in</button></>
              )}
            </p>
          </form>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Header account control: "Log in" for guests, "Profile" (linking to the profile
 * page) once signed in. `variant="menu"` is the full-width version for the mobile menu.
 */
export function AccountButton({ variant = 'bar' }: { variant?: 'bar' | 'menu' }) {
  const guest = useGuest();
  const { lang } = parsePath(usePathname());
  const href = localizePath('/profile', lang);
  const first = guest?.name.split(' ')[0];

  if (variant === 'menu') {
    return guest ? (
      <LimeButton href={href} label={`Profile · ${first}`} className="w-full" />
    ) : (
      <LimeButton label="Log in" className="w-full" onClick={() => auth.openLogin()} disabled={guest === undefined} />
    );
  }
  if (guest) {
    return (
      <SmartLink
        href={href}
        className="acct inline-flex min-h-11 min-w-[8.5rem] items-center justify-between gap-3 px-4 text-sm font-semibold ring-1 ring-inset ring-current/35 transition-colors hover:bg-current/10"
      >
        <span className="inline-flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-lime text-[0.8rem] font-bold uppercase text-ink">{guest.name.charAt(0)}</span>
          <span className="max-w-[7rem] truncate">Profile</span>
        </span>
        <span aria-hidden="true">↗</span>
      </SmartLink>
    );
  }
  return (
    <LimeButton
      label="Log in"
      size="sm"
      onClick={() => auth.openLogin()}
      // Keep the slot steady while the stored session is checked.
      aria-busy={guest === undefined}
      className={`hdr-cta min-w-[8.5rem] justify-between !gap-6 ${guest === undefined ? 'opacity-0' : ''}`}
    />
  );
}
