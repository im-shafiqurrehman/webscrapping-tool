'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from './auth-provider';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const { ready, user, signIn, signUp } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);
  const signup = mode === 'signup';

  useEffect(() => {
    if (ready && user) router.replace('/dashboard');
  }, [ready, router, user]);

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <Sparkles size={19} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Northstar</span>
          </Link>
          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-brand">
              {signup ? 'Create your account' : 'Welcome back'}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {signup ? 'Start finding better clients.' : 'Turn research into revenue.'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {signup
                ? 'Create a secure workspace account to research, score, and manage prospects.'
                : 'Sign in to prioritize prospects, run audits, and move your best opportunities forward.'}
            </p>
          </div>
          <form
            className="mt-8 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setError('');
              const form = new FormData(event.currentTarget);
              const password = String(form.get('password'));
              try {
                if (signup) {
                  if (password !== String(form.get('confirmPassword'))) {
                    throw new Error('Passwords do not match');
                  }
                  await signUp(String(form.get('name')), String(form.get('email')), password);
                } else {
                  await signIn(String(form.get('email')), password, remember);
                }
                router.replace('/dashboard');
              } catch (authError) {
                setError(authError instanceof Error ? authError.message : 'Authentication failed');
                setLoading(false);
              }
            }}
          >
            {signup && (
              <Field label="Full name">
                <input
                  name="name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  required
                  placeholder="Your name"
                  className="h-11 w-full rounded-xl border px-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
                />
              </Field>
            )}
            <Field label="Email address">
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="h-11 w-full rounded-xl border px-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
              />
            </Field>
            <Field label="Password">
              <PasswordInput
                name="password"
                show={show}
                onToggle={() => setShow((current) => !current)}
                placeholder="Enter your password"
                signup={signup}
              />
            </Field>
            {signup && (
              <Field label="Confirm password">
                <PasswordInput name="confirmPassword" show={show} signup />
              </Field>
            )}
            {signup && (
              <p className="text-[10px] leading-4 text-slate-400">
                Use at least 8 characters with uppercase, lowercase, and a number.
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-[11px] font-semibold text-coral"
              >
                {error}
              </p>
            )}
            {!signup && (
              <div className="flex items-center justify-between text-[10px]">
                <label className="flex items-center gap-2 text-slate-500">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="accent-[#147D64]"
                  />{' '}
                  Keep me signed in
                </label>
                <span className="font-semibold text-slate-400">8-hour session</span>
              </div>
            )}
            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? (
                signup ? 'Creating account…' : 'Signing in…'
              ) : (
                <>
                  {signup ? 'Create account' : 'Sign in'} <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>
          <p className="mt-5 text-center text-xs text-slate-500">
            {signup ? 'Already have an account?' : 'New to Northstar?'}{' '}
            <Link
              href={signup ? '/login' : '/signup'}
              className="font-bold text-brand hover:underline"
            >
              {signup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
      <MarketingPanel signup={signup} />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function PasswordInput({
  name,
  show,
  onToggle,
  placeholder,
  signup,
}: {
  name: string;
  show: boolean;
  onToggle?: () => void;
  placeholder?: string;
  signup?: boolean;
}) {
  return (
    <div className="relative">
      <LockKeyhole
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        name={name}
        type={show ? 'text' : 'password'}
        autoComplete={
          name === 'confirmPassword' ? 'new-password' : signup ? 'new-password' : 'current-password'
        }
        minLength={signup ? 8 : 1}
        maxLength={72}
        pattern={signup ? '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,72}' : undefined}
        title={signup ? 'Use 8–72 characters with uppercase, lowercase, and a number.' : undefined}
        required
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border pl-9 pr-10 text-xs outline-none focus:ring-2 focus:ring-brand/15"
      />
      {onToggle && (
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}

function MarketingPanel({ signup }: { signup: boolean }) {
  return (
    <section className="grid-fade relative hidden overflow-hidden bg-[#172A24] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-28 top-20 h-96 w-96 rounded-full bg-[#3FC69A]/15 blur-3xl" />
      <p className="relative text-xs font-bold uppercase tracking-[.2em] text-[#63D7AF]">
        Agency intelligence OS
      </p>
      <div className="relative max-w-xl">
        <p className="text-4xl font-semibold leading-tight tracking-tight">
          {signup
            ? 'Build a repeatable pipeline from responsible public-data research.'
            : 'Know exactly who to contact, why they need you, and what to offer.'}
        </p>
        <div className="mt-10 grid grid-cols-3 gap-3">
          {[
            ['16', 'Prospects'],
            ['3', 'Excellent'],
            ['79', 'Top niche score'],
          ].map(([value, label]) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur"
              key={label}
            >
              <p className="text-2xl font-extrabold text-[#79DEBB]">{value}</p>
              <p className="mt-1 text-[10px] text-white/45">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="relative text-[10px] text-white/35">
        Public data · Transparent scoring · Evidence-backed outreach
      </p>
    </section>
  );
}
