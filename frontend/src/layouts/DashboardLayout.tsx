import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  FlaskConical,
  Gauge,
  LogOut,
  Menu,
  Moon,
  Shield,
  ShieldAlert,
  Sun,
  Users,
  X,
  LockKeyhole
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Role } from '../types';

type NavItem = { label: string; href: string; roles?: Role[] };
type NavGroup = { label: string; icon: typeof Gauge; items: NavItem[] };

const clientGroups: NavGroup[] = [
  {
    label: 'Overview',
    icon: Gauge,
    items: [
      { label: 'Dashboard', href: '/client' },
      { label: 'Security Score', href: '/client/security-score' },
      { label: 'Security Settings', href: '/client/security' }
    ]
  },
  {
    label: 'Security Platform',
    icon: ShieldAlert,
    items: [
      { label: 'Security Posture', href: '/client/security-posture' },
      { label: 'Security Events', href: '/client/security-events' },
      { label: 'Attack Surface', href: '/client/attack-surface' },
      { label: 'Compliance', href: '/client/compliance' },
      { label: 'Attack Lab', href: '/client/attack-lab' }
    ]
  },
  {
    label: 'Operations',
    icon: Building2,
    items: [
      { label: 'Reports', href: '/client/reports' },
      { label: 'Tickets', href: '/client/tickets' },
      { label: 'Requests', href: '/client/requests' },
      { label: 'Billing', href: '/client/billing' },
      { label: 'Subscription', href: '/client/subscription' }
    ]
  },
  {
    label: 'Company & Support',
    icon: Users,
    items: [
      { label: 'Company', href: '/client/company' },
      { label: 'Team', href: '/client/team' },
      { label: 'Messaging', href: '/client/messages' },
      { label: 'Meetings', href: '/client/meetings' },
      { label: 'Knowledge Base', href: '/client/knowledge-base' },
      { label: 'Notifications', href: '/client/notifications' },
      { label: 'Audit Logs', href: '/client/audit-logs' },
      { label: 'Account', href: '/client/account' }
    ]
  }
];

const iconByLabel: Record<string, typeof Gauge> = {
  Dashboard: Gauge,
  'Security Score': Activity,
  'Security Settings': LockKeyhole,
  'Security Posture': ClipboardCheck,
  'Security Events': ShieldAlert,
  'Attack Surface': FileSearch,
  Compliance: ClipboardCheck,
  'Attack Lab': FlaskConical,
  Reports: FileSearch,
  Tickets: Activity,
  Requests: Activity,
  Billing: BriefcaseBusiness,
  Subscription: BriefcaseBusiness,
  Company: Building2,
  Team: Users,
  Messaging: Bell,
  Meetings: Activity,
  'Knowledge Base': FileSearch,
  Notifications: Bell,
  'Audit Logs': FileSearch,
  Account: LockKeyhole
};

const adminGroups: NavGroup[] = [
  { label: 'Overview', icon: Gauge, items: [['Dashboard', '/admin'], ['System Health', '/admin/system-health'], ['Audit Logs', '/admin/audit-logs']].map(([label, href]) => ({ label, href })) },
  { label: 'Clients & Operations', icon: Building2, items: [['Clients', '/admin/clients'], ['Tickets', '/admin/tickets'], ['Requests', '/admin/requests'], ['Reports Upload', '/admin/reports-upload']].map(([label, href]) => ({ label, href })) },
  { label: 'Staff & Internal Ops', icon: Users, items: [['Staff', '/admin/staff'], ['Scheduling', '/admin/scheduling'], ['SOC Ops', '/admin/soc'], ['CRM', '/admin/crm']].map(([label, href]) => ({ label, href })) },
  {
    label: 'Security & Pentest',
    icon: ShieldAlert,
    items: [
      ['Pentest', '/admin/pentest'],
      ['Threat Models', '/admin/threat-models'],
      ['Attack Surface', '/admin/attack-surface'],
      ['Test Cases', '/admin/test-cases'],
      ['Scans', '/admin/scans'],
      ['Vulnerability Analysis', '/admin/vulnerability-analysis'],
      ['Evidence', '/admin/evidence'],
      ['Report Builder', '/admin/report-builder'],
      ['CI Security', '/admin/ci-security'],
      ['Security Events', '/admin/security-events'],
      ['Attack Lab', '/admin/attack-lab']
    ].map(([label, href]) => ({ label, href }))
  },
  { label: 'Business & Compliance', icon: BriefcaseBusiness, items: [{ label: 'Billing', href: '/admin/billing', roles: ['ADMIN', 'SUPERADMIN'] }, { label: 'Compliance', href: '/admin/compliance' }] },
  { label: 'AI & Automation', icon: Bot, items: [{ label: 'AI Assistant', href: '/admin/ai-assistant' }] }
];

export function DashboardLayout({ admin = false }: { admin?: boolean }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const canView = (item: NavItem) => !item.roles || (user?.role && item.roles.includes(user.role));
  const groups = admin
    ? adminGroups.map(group => ({ ...group, items: group.items.filter(canView) })).filter(group => group.items.length)
    : clientGroups;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    groups.reduce((state, group) => {
      const hasActiveItem = group.items.some(item => item.href === location.pathname || (item.href !== '/client' && item.href !== '/admin' && location.pathname.startsWith(item.href)));
      return { ...state, [group.label]: !hasActiveItem };
    }, {} as Record<string, boolean>)
  );

  return (
    <div className={`min-h-screen ${lightMode ? 'bg-slate-100 text-slate-950' : 'bg-[radial-gradient(circle_at_80%_0%,rgba(0,255,153,0.14),transparent_34%),linear-gradient(135deg,#081120,#050c17)] text-white'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-white/10 ${lightMode ? 'bg-white' : 'bg-white/[0.04]'} p-5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3 font-black text-shield-glow hover:opacity-80 transition-opacity" aria-label="NaijaShield Portal Home">
            <img src="/logo.svg" alt="NaijaShield logo" className="h-11 w-11 rounded-xl object-contain bg-white/5 p-2" />
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
        <nav className="grid gap-3" role="navigation" aria-label="Main navigation">
          {groups.map(group => {
            const Icon = group.icon;
            const active = group.items.some(item => item.href === location.pathname || (item.href !== '/client' && item.href !== '/admin' && location.pathname.startsWith(item.href)));
            const isCollapsed = collapsed[group.label] ?? false;
            return (
              <section key={group.label} className="rounded-xl border border-white/5 bg-white/[0.025] p-2">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-black uppercase tracking-widest transition-colors ${active ? 'text-shield-glow' : 'text-slate-400 hover:text-white'}`}
                  aria-expanded={!isCollapsed}
                  onClick={() => setCollapsed(value => ({ ...value, [group.label]: !isCollapsed }))}
                >
                  <span className="flex items-center gap-2"><Icon size={15} />{group.label}</span>
                  {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                </button>
                {!isCollapsed && <div className="mt-1 grid gap-1">
                  {group.items.map(item => {
                    const ItemIcon = iconByLabel[item.label] || Activity;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/admin' || item.href === '/client'}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors duration-200 ${isActive ? 'bg-shield-glow/15 text-shield-glow ring-1 ring-shield-glow/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                      >
                        <ItemIcon size={16} />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>}
              </section>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className={`sticky top-0 z-20 flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur-xl ${lightMode ? 'bg-white/90' : 'bg-shield-navy/80'}`}>
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
              onClick={() => setLightMode(value => !value)}
              className="rounded-full border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors" 
              aria-label="Toggle light mode"
            >
              {lightMode ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            </button>
            <NavLink
              to={admin ? '/admin/audit-logs' : '/client/notifications'}
              className="rounded-full border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors" 
              aria-label="Notifications"
            >
              <Bell size={18} aria-hidden="true" />
            </NavLink>
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
