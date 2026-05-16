import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  ['About', '/about'],
  ['Services', '/services'],
  ['Pricing', '/pricing'],
  ['Resources', '/blog'],
  ['Contact', '/contact']
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_75%_10%,rgba(0,255,153,0.16),transparent_32%),linear-gradient(135deg,#081120,#050c17)]">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
      )}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-shield-navy/85 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 font-black text-shield-glow hover:opacity-80 transition-opacity" aria-label="NaijaShield Home">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-shield-green to-shield-glow text-shield-deep">
              <Shield size={22} aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">NaijaShield</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 font-semibold text-slate-200 md:flex" role="navigation">
            {navLinks.map(([label, href]) => (
              <Link 
                key={href}
                to={href} 
                className="hover:text-shield-glow transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
            <Link to="/login" className="btn-secondary py-2">
              Login
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mt-4 grid gap-2 md:hidden" role="navigation">
            {navLinks.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-2 text-slate-200 hover:bg-white/10 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-secondary mt-2"
            >
              Login
            </Link>
          </nav>
        )}
      </header>
      <Outlet />
    </div>
  );
}
