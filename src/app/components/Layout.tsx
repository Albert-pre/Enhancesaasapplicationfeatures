import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, FileText, Package, TrendingUp,
  Calculator, Settings, ChevronLeft, ChevronRight,
  Bell, User, Menu, X, AlertTriangle, Zap, LogOut, Loader2
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { path: '/contrats',   label: 'Contrats',   icon: FileText,        end: false },
  { path: '/produits',   label: 'Produits',   icon: Package,         end: false },
  { path: '/revenus',    label: 'Revenus',    icon: TrendingUp,      end: false },
  { path: '/simulation', label: 'Simulation', icon: Calculator,      end: false },
  { path: '/parametres', label: 'Paramètres', icon: Settings,        end: false },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { renewalAlerts, loading } = useApp();
  const { user, profile, signOut, isConfigured } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const displayName = profile?.cabinet_name || profile?.first_name || user?.email?.split('@')[0] || 'Mon Cabinet';
  const displayEmail = user?.email || 'Mode Demo';

  const currentPage = NAV_ITEMS.find(item =>
    item.end ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 flex flex-col
        bg-[#0d1b38] text-white transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm" style={{ fontWeight: 700, lineHeight: 1.2 }}>CommissPro</p>
                <p className="text-slate-400" style={{ fontSize: 10 }}>Gestion Commissions</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs text-slate-500 px-3 mb-3 uppercase tracking-widest" style={{ fontSize: 10 }}>Navigation</p>
          )}
          {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                ${isActive
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={`flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                  {!collapsed && (
                    <>
                      <span className="text-sm flex-1">{label}</span>
                      {label === 'Dashboard' && renewalAlerts.length > 0 && (
                        <span className="text-xs bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ fontSize: 10 }}>
                          {renewalAlerts.length}
                        </span>
                      )}
                      {isActive && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status section */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-white/5">
            <div className="bg-white/5 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400" style={{ fontWeight: 500 }}>Synchronisé</span>
              </div>
              <p className="text-xs text-slate-500">Données à jour</p>
            </div>
          </div>
        )}

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          <div className="relative">
            <div 
              onClick={() => !collapsed && setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-white" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
                </div>
              )}
            </div>
            {/* User dropdown menu */}
            {showUserMenu && !collapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a2d50] rounded-xl border border-white/10 shadow-xl overflow-hidden">
                <NavLink
                  to="/parametres"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Settings size={16} />
                  Parametres
                </NavLink>
                {isConfigured && (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Deconnexion
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-slate-800" style={{ fontSize: 17, fontWeight: 700 }}>{currentPage?.label || 'Dashboard'}</h1>
              <p className="text-slate-400 text-xs hidden sm:block">CommissPro · Gestion des commissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full border border-emerald-200">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span style={{ fontWeight: 500 }}>Mars 2026</span>
            </div>
            {renewalAlerts.length > 0 && (
              <button className="relative p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                <AlertTriangle size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
              </button>
            )}
            <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <Bell size={17} />
            </button>
            {loading && (
              <Loader2 size={17} className="text-blue-500 animate-spin" />
            )}
            <div 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center cursor-pointer"
              title={displayName}
            >
              <User size={13} className="text-white" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1b38',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}
