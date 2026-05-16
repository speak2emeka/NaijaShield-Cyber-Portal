import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    try {
      await register(payload);
      toast.success('Account created successfully!');
      navigate('/client');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-shield-navy px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-shield-green to-shield-glow text-shield-deep">
            <Shield size={24} aria-hidden="true" />
          </div>
          <span className="text-2xl font-black text-shield-glow">NaijaShield</span>
        </div>

        <form onSubmit={submit} className="glass-card grid gap-5 p-8" noValidate>
          <div className="mb-2">
            <h1 className="text-3xl font-black">Client Onboarding</h1>
            <p className="mt-1 text-sm text-slate-400">Create your account to get started</p>
          </div>

          {/* Personal Information Section */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-slate-300 mb-3">Personal Information</legend>
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input id="name" className="input" name="name" placeholder="John Doe" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input id="email" className="input" name="email" type="email" placeholder="your.email@example.com" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" className="input" name="password" type="password" placeholder="Enter a strong password" required aria-required="true" />
              <p className="text-xs text-slate-500 mt-1">At least 8 characters recommended</p>
            </div>
          </fieldset>

          {/* Company Information Section */}
          <fieldset className="space-y-4 border-t border-white/10 pt-5">
            <legend className="text-sm font-bold text-slate-300 mb-3">Company Information</legend>
            <div>
              <label htmlFor="companyName" className="label">Company Name</label>
              <input id="companyName" className="input" name="companyName" placeholder="Your Company Ltd" required aria-required="true" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="industry" className="label">Industry</label>
                <input id="industry" className="input" name="industry" placeholder="Finance, Tech, etc." required aria-required="true" />
              </div>
              <div>
                <label htmlFor="size" className="label">Company Size</label>
                <select id="size" className="input" name="size" required aria-required="true">
                  <option value="">Select size</option>
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Agreement */}
          <div className="flex items-start gap-3 border-t border-white/10 pt-5">
            <input type="checkbox" id="terms" name="terms" className="mt-1" required aria-required="true" />
            <label htmlFor="terms" className="text-sm text-slate-300">
              I agree to the <Link to="#" className="text-shield-glow hover:underline">Terms of Service</Link> and <Link to="#" className="text-shield-glow hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary mt-2" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? (<><span className="loading-spinner">⏳</span>Creating account...</>) : 'Create Account'}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-shield-glow hover:text-shield-glow/80 transition-colors font-bold">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
