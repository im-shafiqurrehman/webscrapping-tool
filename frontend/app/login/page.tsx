'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { loginWithApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <Sparkles size={19} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Northstar</span>
          </div>
          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-brand">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Turn research into revenue.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in to prioritize prospects, run audits, and move your best opportunities forward.
            </p>
          </div>
          <form
            className="mt-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError('');
              const form = new FormData(e.currentTarget);
              try {
                const session = await loginWithApi(
                  String(form.get('email')),
                  String(form.get('password')),
                );
                window.localStorage.setItem('northstar_token', session.token);
                router.push('/dashboard');
              } catch (loginError) {
                setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
                setLoading(false);
              }
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-600">
                Email address
              </span>
              <input
                name="email"
                type="email"
                required
                defaultValue="admin@northstar.local"
                className="h-11 w-full rounded-xl border px-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-600">Password</span>
              <div className="relative">
                <LockKeyhole
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  required
                  defaultValue="Northstar123!"
                  className="h-11 w-full rounded-xl border pl-9 pr-10 text-xs outline-none focus:ring-2 focus:ring-brand/15"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-[11px] font-semibold text-coral">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between text-[10px]">
              <label className="flex items-center gap-2 text-slate-500">
                <input type="checkbox" className="accent-[#147D64]" /> Keep me signed in
              </label>
              <button type="button" className="font-bold text-brand">
                Forgot password?
              </button>
            </div>
            <Button className="h-11 w-full" disabled={loading}>
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>
          <p className="mt-5 text-center text-[9px] leading-4 text-slate-400">
            Demo credentials are prefilled. Production authentication uses the Express API and
            expiring JWTs.
          </p>
        </div>
      </section>
      <section className="grid-fade relative hidden overflow-hidden bg-[#172A24] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-20 h-96 w-96 rounded-full bg-[#3FC69A]/15 blur-3xl" />
        <p className="relative text-xs font-bold uppercase tracking-[.2em] text-[#63D7AF]">
          Agency intelligence OS
        </p>
        <div className="relative max-w-xl">
          <p className="text-4xl font-semibold leading-tight tracking-tight">
            Know exactly who to contact, why they need you, and what to offer.
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
    </main>
  );
}
