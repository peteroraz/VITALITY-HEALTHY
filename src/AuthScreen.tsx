import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { Eye, EyeOff, HeartPulse, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { requireAuth } from '../firebase';
import { PENDING_DISPLAY_NAME_KEY } from './constants';

type Mode = 'sign-in' | 'create';

function friendlyAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account already exists for this email address.',
    'auth/invalid-credential': 'The email address or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/account-exists-with-different-credential': 'An account already exists for this email. Sign in using its original method first.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled before it finished.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/weak-password': 'Use a stronger password with at least 8 characters.',
    'auth/network-request-failed': 'Check your internet connection and try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
  };

  return messages[code] || 'We could not complete that request. Please try again.';
}

export function AuthScreen({ configurationError }: { configurationError?: string | null }) {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(configurationError || null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(configurationError || null);
    setNotice(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (configurationError) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const firebaseAuth = requireAuth();
      if (mode === 'create') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setError('Enter your full name.');
          return;
        }
        if (password.length < 8) {
          setError('Use a password with at least 8 characters.');
          return;
        }

        sessionStorage.setItem(PENDING_DISPLAY_NAME_KEY, trimmedName);
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        await updateProfile(credential.user, { displayName: trimmedName });
        await sendEmailVerification(credential.user).catch((verificationError) => {
          console.warn('Account created, but verification email could not be sent:', verificationError);
        });
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      }
    } catch (caught) {
      sessionStorage.removeItem(PENDING_DISPLAY_NAME_KEY);
      setError(friendlyAuthError(caught));
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async () => {
    if (configurationError) return;
    if (!email.trim()) {
      setError('Enter your email address first, then select Forgot password.');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await sendPasswordResetEmail(requireAuth(), email.trim());
      setNotice('Password reset email sent. Check your inbox and spam folder.');
    } catch (caught) {
      setError(friendlyAuthError(caught));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (configurationError) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(requireAuth(), provider);
    } catch (caught) {
      setError(friendlyAuthError(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-2xl shadow-emerald-900/10">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Vitality</h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'sign-in' ? 'Sign in to continue your healthy living journey.' : 'Create your private wellness account.'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm font-semibold">
          <button type="button" onClick={() => switchMode('sign-in')} className={`rounded-lg px-3 py-2 transition ${mode === 'sign-in' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>
            Sign in
          </button>
          <button type="button" onClick={() => switchMode('create')} className={`rounded-lg px-3 py-2 transition ${mode === 'create' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>
            Create account
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy || Boolean(configurationError)}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
            <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z" />
            <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          <span>or use email</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Full name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20" placeholder="Your full name" />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Email address</span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20" placeholder="you@example.com" />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Password</span>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} minLength={mode === 'create' ? 8 : undefined} required className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20" placeholder={mode === 'create' ? 'At least 8 characters' : 'Your password'} />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {mode === 'sign-in' && (
            <div className="text-right">
              <button type="button" disabled={busy} onClick={handlePasswordReset} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50">
                Forgot password?
              </button>
            </div>
          )}

          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

          <button type="submit" disabled={busy || Boolean(configurationError)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-bold text-white shadow-md transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {mode === 'sign-in' ? 'Sign in securely' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          Your wellness profile and daily logs are private to your account.
        </p>
      </section>
    </main>
  );
}
