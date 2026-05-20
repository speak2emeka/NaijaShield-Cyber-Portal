import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const demoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' || typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const [email, setEmail] = useState(demoModeEnabled ? 'client@example.com' : '');
  const [password, setPassword] = useState(demoModeEnabled ? 'client123' : '');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      navigate(user.role === 'CLIENT' ? '/client' : '/admin');
    } catch (error: any) {
      toast.error(error.userMessage || 'Sign-in failed. Check your credentials and API connection.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-shield-navy px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="mb-2 flex items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-shield-green to-shield-glow text-shield-deep">
            <Shield size={24} aria-hidden="true" />
          </div>
          <span className="text-2xl font-black text-shield-glow">NaijaShield</span>
        </div>

        <form onSubmit={submit} className="glass-card p-8" noValidate>
          <div className="mb-4">
            <h1 className="text-3xl font-black">Sign in</h1>
            <p className="mt-1 text-sm text-slate-400">Access your client portal for posture, compliance, tickets, and secure operations.</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-bold text-slate-100">New here?</p>
            <p>Use NaijaShield to review your security posture, launch Attack Lab readiness runs, and keep compliance evidence centralized.</p>
            <p className="text-slate-400">If you need help, ask your security operations team or reach out to support@naijashield.ng.</p>
          </div>

          {demoModeEnabled && (
            <div className="mt-4 rounded-lg bg-shield-green/10 border border-shield-green/20 p-3 text-sm text-slate-200">
              <p className="font-bold text-shield-green mb-2">Demo credentials</p>
              <p>Admin: <code className="bg-black/30 px-1 py-0.5 rounded">admin@naijashield.ng</code></p>
              <p>Client: <code className="bg-black/30 px-1 py-0.5 rounded">client@example.com</code></p>
            </div>
          )}

          <div className="mt-6 grid gap-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                className="input"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  className="input pr-10"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button 
              type="submit"
              className="btn-primary mt-2"
              disabled={isLoading || !email || !password}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Sign up link */}
            <Link 
              to="/register" 
              className="text-center text-sm font-bold text-shield-glow hover:text-shield-glow/80 transition-colors py-2"
            >
              Don't have an account? Create one
            </Link>
            <Link 
              to="/forgot-password" 
              className="text-center text-xs font-bold text-slate-400 hover:text-shield-glow transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
