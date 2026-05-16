import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bell, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const clientLinks = [
  ['Dashboard', '/client'],
  ['Reports', '/client/reports'],
  ['Tickets', '/client/tickets'],
  ['Requests', '/client/requests'],
  ['Account', '/client/account']
];

const adminLinks = [
  ['Dashboard', '/admin'],
  ['Clients', '/admin/clients'],
  ['Tickets', '/admin/tickets'],
  ['Requests', '/admin/requests'],
  ['Audit Logs', '/admin/audit-logs']
];

export function DashboardLayout({ admin = false }: { admin?: boolean }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = admin ? adminLinks : clientLinks;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(0,255,153,0.14),transparent_34%),linear-gradient(135deg,#081120,#050c17)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3 font-black text-shield-glow hover:opacity-80 transition-opacity" aria-label="NaijaShield Portal Home">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-shield-green to-shield-glow text-shield-deep">
              <Shield size={22} aria-hidden="true" />
            </span>
            <span>NaijaShield</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-2 hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="grid gap-2" role="navigation" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <NavLink 
              key={href} 
              to={href} 
              end 
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `rounded-xl px-4 py-3 font-bold transition-colors duration-200 ${isActive ? 'bg-shield-glow/15 text-shield-glow' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-shield-navy/80 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition-colors"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-shield-glow">{admin ? 'Admin Portal' : 'Client Portal'}</p>
              <h1 className="text-xl font-black">{user?.name || 'Loading...'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="rounded-full border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors" 
              aria-label="Notifications"
            >
              <Bell size={18} aria-hidden="true" />
            </button>
            <button 
              onClick={logout} 
              className="btn-secondary py-2" 
              aria-label="Sign out"
            >
              <LogOut size={16} aria-hidden="true" /> 
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="p-6" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
