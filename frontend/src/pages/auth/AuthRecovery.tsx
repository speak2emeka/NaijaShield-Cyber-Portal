import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';

export function ForgotPassword() {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post('/enterprise/auth/request-password-reset', Object.fromEntries(new FormData(event.currentTarget).entries()));
    toast.success('If the account exists, a reset link has been sent');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-shield-navy px-6">
      <form onSubmit={submit} className="glass-card w-full max-w-md p-8">
        <h1 className="text-3xl font-black">Reset password</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your email to receive a secure reset link.</p>
        <label className="label mt-6" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" />
        <button type="submit" className="btn-primary mt-5 w-full">Send reset link</button>
        <Link to="/login" className="mt-4 block text-center text-sm font-bold text-shield-glow">Back to sign in</Link>
      </form>
    </main>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    await api.post('/enterprise/auth/reset-password', { ...payload, token: params.get('token') });
    setDone(true);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-shield-navy px-6">
      <form onSubmit={submit} className="glass-card w-full max-w-md p-8">
        <h1 className="text-3xl font-black">{done ? 'Password updated' : 'Choose a new password'}</h1>
        {done ? <Link to="/login" className="btn-primary mt-6 w-full">Sign in</Link> : (
          <>
            <label className="label mt-6" htmlFor="password">New Password</label>
            <input id="password" name="password" type="password" minLength={8} required className="input" />
            <button type="submit" className="btn-primary mt-5 w-full">Update password</button>
          </>
        )}
      </form>
    </main>
  );
}

export function VerifyEmail() {
  const [params] = useSearchParams();

  async function verify() {
    await api.post('/enterprise/auth/verify-email', { token: params.get('token') });
    toast.success('Email verified');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-shield-navy px-6">
      <section className="glass-card w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-black">Verify email</h1>
        <p className="mt-2 text-sm text-slate-400">Activate your NaijaShield account.</p>
        <button onClick={verify} className="btn-primary mt-6 w-full">Verify account</button>
      </section>
    </main>
  );
}
