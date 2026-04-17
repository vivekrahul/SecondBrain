'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspace, type WorkspaceMode } from '@/context/WorkspaceContext';

const MAIN_NAV = [
  { href: '/',         icon: 'home',            label: 'Home',     key: 'home',     modes: ['home', 'work'] },
  { href: '/ideas',   icon: 'lightbulb',        label: 'Ideas',    key: 'ideas',    modes: ['home', 'work'] },
  { href: '/focus',   icon: 'self_improvement', label: 'Focus',    key: 'focus',    modes: ['home', 'work'] },
  { href: '/shopping',icon: 'shopping_cart',    label: 'Shopping', key: 'shopping', modes: ['home'] },
  { href: '/tasks',   icon: 'task_alt',         label: 'Tasks',    key: 'tasks',    modes: ['home', 'work'] },
];

const BOTTOM_NAV = [
  { href: '/workout', icon: 'fitness_center',  label: 'Gym Log',      key: 'workout', modes: ['home', 'work'] },
  { href: '/logs',    icon: 'history',         label: 'Activity Log', key: 'logs',    modes: ['home', 'work'] },
];

export default function Sidebar({ displayName, hiddenTabs = [] }: { displayName?: string; hiddenTabs?: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useWorkspace();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '?';

  const visibleMain = MAIN_NAV.filter(item =>
    item.modes.includes(mode) && !hiddenTabs.includes(item.key)
  );

  const visibleBottom = BOTTOM_NAV.filter(item =>
    !hiddenTabs.includes(item.key)
  );

  const navLink = (item: { href: string; icon: string; label: string }) => {
    const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={true}
        className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 ${
          isActive
            ? 'bg-surface-container-lowest text-primary font-bold'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
        }`}
      >
        <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
          {item.icon}
        </span>
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-surface-container-low p-6 space-y-6 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center px-4">
        <span className="text-2xl font-black bg-gradient-to-br from-[#5f4ea5] to-[#b3a1ff] bg-clip-text text-transparent tracking-tighter">
          Second Brain
        </span>
      </div>

      {/* Workspace Mode Toggle */}
      <div className="px-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 px-2 mb-2">Workspace</p>
        <div className="flex bg-surface-container rounded-full p-1">
          {(['home', 'work'] as WorkspaceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg" style={mode === m ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {m === 'home' ? 'cottage' : 'work'}
              </span>
              <span className="capitalize">{m}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {visibleMain.map(navLink)}
      </nav>

      {/* Bottom Nav Items */}
      <div className="space-y-1">
        {visibleBottom.map(navLink)}
        <div className="flex gap-2">
          <Link
            href="/settings"
            prefetch={true}
            className={`flex-1 flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 ${
              pathname === '/settings'
                ? 'bg-surface-container-lowest text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link
            href="/insights"
            prefetch={true}
            className={`flex items-center justify-center w-12 rounded-full transition-all duration-300 ${
              pathname === '/insights'
                ? 'bg-surface-container-lowest text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
            title="Insights"
          >
            <span className="material-symbols-outlined">analytics</span>
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-error-container/10 hover:text-error transition-all duration-300 w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="p-4 bg-surface-container rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate">{displayName || 'My Brain'}</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
              {mode === 'work' ? '💼 Work Mode' : '🏠 Home Mode'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
