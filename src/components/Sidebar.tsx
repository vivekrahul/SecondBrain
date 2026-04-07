'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/ideas', icon: 'lightbulb', label: 'Ideas' },
  { href: '/focus', icon: 'self_improvement', label: 'Focus' },
  { href: '/shopping', icon: 'shopping_cart', label: 'Shopping' },
  { href: '/tasks', icon: 'task_alt', label: 'Tasks' },
];

export default function Sidebar({ displayName }: { displayName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-surface-container-low p-6 space-y-8 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center px-4">
        <span className="text-2xl font-black bg-gradient-to-br from-[#5f4ea5] to-[#b3a1ff] bg-clip-text text-transparent tracking-tighter">
          Second Brain
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-surface-container-lowest text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Profile */}
      <div className="space-y-2">
        <Link
          href="/workout"
          className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 ${
            pathname === '/workout'
              ? 'bg-surface-container-lowest text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">fitness_center</span>
          <span className="text-sm font-medium">Gym Log</span>
        </Link>
        <Link
          href="/logs"
          className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 ${
            pathname === '/logs'
              ? 'bg-surface-container-lowest text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">history</span>
          <span className="text-sm font-medium">Activity Log</span>
        </Link>
        <div className="flex gap-2">
          <Link
            href="/settings"
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
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Second Brain</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
