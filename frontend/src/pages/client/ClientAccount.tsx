import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export function ClientAccount() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      {/* Account Header */}
      <div>
        <h1 className="text-3xl font-black">Account Settings</h1>
        <p className="text-slate-300 mt-2">Manage your account information and preferences</p>
      </div>

      {/* Profile Information */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="bg-shield-green/20 rounded-lg p-2">
            <User size={20} className="text-shield-green" />
          </div>
          Profile Information
        </h2>
        
        <div className="space-y-5">
          {/* Name */}
          <div className="pb-5 border-b border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Full Name</p>
            <p className="text-lg font-bold text-white">{user?.name || 'Not set'}</p>
          </div>

          {/* Email */}
          <div className="pb-5 border-b border-white/10 flex items-start gap-3">
            <div className="bg-shield-glow/10 rounded-lg p-2 mt-1 flex-shrink-0">
              <Mail size={18} className="text-shield-glow" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email Address</p>
              <p className="text-lg font-bold text-white">{user?.email || 'Not set'}</p>
            </div>
          </div>

          {/* Role */}
          <div className="pb-5 border-b border-white/10 flex items-start gap-3">
            <div className="bg-shield-glow/10 rounded-lg p-2 mt-1 flex-shrink-0">
              <Shield size={18} className="text-shield-glow" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Account Role</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-success text-sm">
                  {user?.role || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6">Security</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <div>
              <p className="font-bold">Password</p>
              <p className="text-sm text-slate-400">Change your account password</p>
            </div>
            <button className="btn-tertiary py-2 px-4">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <div>
              <p className="font-bold">Two-Factor Authentication</p>
              <p className="text-sm text-slate-400">Add an extra layer of security</p>
            </div>
            <button className="btn-tertiary py-2 px-4">
              Enable
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6">Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Email Notifications</p>
              <p className="text-sm text-slate-400">Receive updates about tickets and reports</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <p className="font-bold">Weekly Reports</p>
              <p className="text-sm text-slate-400">Receive weekly security summary</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button 
        onClick={logout}
        className="btn-secondary w-full gap-2 py-3"
      >
        <LogOut size={18} aria-hidden="true" />
        Sign Out
      </button>
    </div>
  );
}
