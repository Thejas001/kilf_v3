'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import { LimeButton } from './LimeButton';
import * as auth from '@/lib/auth';
import { PASSWORD_HINT, validPassword, type Guest } from '@/lib/auth';

type View = 'login' | 'register' | 'forgot' | 'reset' | 'done';

const control =
  'block w-full rounded-none border border-line bg-white py-3.5 text-base text-navy placeholder:text-muted/70 transition-colors hover:border-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20 aria-[invalid=true]:border-coral-ink aria-[invalid=true]:ring-coral-ink/20';

const copy: Record<Exclude<View, 'done'>, { eyebrow: string; title: string; lead: string }> = {
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
 * Account button for the header plus the login popup it opens (a native
 * <dialog>: focus trap, Esc and backdrop come for free). Other components can
 * open it with window.dispatchEvent(new Event('kilf:auth')).
 */
export function AccountButton() {
  const dlg = useRef<HTMLDialogElement>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [menu, setMenu] = useState(false);
  const [view, setView] = useState<View>('login');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', token: '' });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    auth.me().then(setGuest);
    const open = () => openDialog('login');
    window.addEventListener('kilf:auth', open);
    return () => window.removeEventListener('kilf:auth', open);
  }, []);

  function openDialog(v: View) {
    go(v);
    if (!dlg.current?.open) {
      dlg.current?.showModal();
      document.documentElement.classList.add('overflow-hidden');
    }
  }
  function closeDialog() {
    dlg.current?.close();
  }
  function go(v: View) {
    setView(v);
    setFormError('');
    setErrors({});
    if (v !== 'reset') setNotice('');
    setF((p) => ({ ...p, password: '', confirm: '' }));
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
        setGuest(await auth.login(email, f.password));
        setView('done');
      } else if (view === 'register') {
        setGuest(await auth.register({ name: f.name.trim(), email, password: f.password, confirmPassword: f.confirm }));
        setView('done');
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
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setMenu(false);
    await auth.logout();
    setGuest(null);
  }

  const c = view === 'done' ? null : copy[view];
  const first = guest?.name.split(' ')[0];

  return (
    <>
      {guest ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            className="acct inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold ring-1 ring-inset ring-current/35 transition-colors hover:bg-current/10"
          >
            <Icon name="user" size={18} />
            <span className="hidden max-w-[7rem] truncate sm:inline">{first}</span>
          </button>
          {menu && (
            <div className="absolute right-0 top-full z-10 mt-2 w-60 border border-line bg-white p-4 text-navy shadow-[0_18px_40px_-18px_rgb(15_26_71/0.35)]">
              <p className="truncate font-display text-base font-semibold">{guest.name}</p>
              <p className="truncate text-sm text-muted">{guest.email}</p>
              <button type="button" onClick={signOut} className="mt-3 min-h-11 w-full border border-navy/30 text-sm font-semibold hover:bg-navy/5">
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <LimeButton label="Log in" size="sm" onClick={() => openDialog('login')} className="hdr-cta min-w-[8.5rem] justify-between !gap-6" />
      )}

      <dialog
        ref={dlg}
        aria-labelledby="auth-title"
        onClose={() => {
          document.documentElement.classList.remove('overflow-hidden');
        }}
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

            {view === 'done' ? (
              <div className="py-6 pr-8">
                <span className="grid size-12 place-items-center bg-lime text-ink"><Icon name="check" size={24} /></span>
                <h2 id="auth-title" className="display mt-5 text-[2rem] text-navy">You&rsquo;re in{first ? `, ${first}` : ''}.</h2>
                <p className="mt-2 text-muted">Your account is ready. See you at the lake.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <LimeButton href="/passes" label="Browse passes" />
                  <LimeButton label="Close" variant="ghost" arrow={false} onClick={closeDialog} />
                </div>
              </div>
            ) : (
              c && (
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
              )
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
