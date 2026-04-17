'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspace, type WorkspaceMode } from '@/context/WorkspaceContext';

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useWorkspace();

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

  const handleModeSwitch = (newMode: WorkspaceMode) => {
    setMode(newMode);
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/', icon: 'home', label: 'Home' },
    { href: '/ideas', icon: 'lightbulb', label: 'Ideas' },
    { href: '/focus', icon: 'self_improvement', label: 'Focus Mode' },
    { href: '/tasks', icon: 'task_alt', label: 'Tasks' },
    { href: '/shopping', icon: 'shopping_cart', label: 'Shopping' },
    { href: '/workout', icon: 'fitness_center', label: 'Gym Log' },
    { href: '/logs', icon: 'history', label: 'Activity Log' },
  ];

  return (
    <>
      <header className="flex justify-between items-center py-2">
        <button 
          onClick={toggleMenu} 
          className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-surface-container transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">menu</span>
        </button>

        {/* Compact Workspace Toggle Pill — always visible in mobile header */}
        <button
          onClick={() => handleModeSwitch(mode === 'home' ? 'work' : 'home')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container active:scale-95 transition-all"
          aria-label={`Switch to ${mode === 'home' ? 'Work' : 'Home'} mode`}
        >
          <span className="text-sm">{mode === 'home' ? '🏠' : '💼'}</span>
          <span className="text-xs font-bold text-on-surface-variant capitalize">{mode}</span>
        </button>

        <Link href="/settings" prefetch={true} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container active:scale-95 transition-transform" aria-label="Settings">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
        </Link>
      </header>

      {/* Fullscreen Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* Dim backdrop — blocks all interaction behind */}
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={toggleMenu}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <nav 
            className="absolute top-0 left-0 w-72 h-full bg-surface shadow-2xl flex flex-col overflow-y-auto"
            style={{ animation: 'slideDrawerIn 0.25s ease-out' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
                <span className="font-bold text-on-surface">Second Brain</span>
              </div>
              <button 
                onClick={toggleMenu}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
              </button>
            </div>

            {/* Workspace Mode Toggle inside Drawer */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 px-2 mb-2">Workspace</p>
              <div className="flex bg-surface-container rounded-full p-1">
                {(['home', 'work'] as WorkspaceMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeSwitch(m)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                      mode === m
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="text-base">{m === 'home' ? '🏠' : '💼'}</span>
                    <span className="capitalize">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span 
                      className="material-symbols-outlined text-xl"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Section */}
            <div className="px-4 pb-6 pt-2 border-t border-surface-variant space-y-1">
              <Link
                href="/settings"
                prefetch={true}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm ${
                  pathname === '/settings'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-xl">settings</span>
                Settings
              </Link>
              <Link
                href="/insights"
                prefetch={true}
                className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">analytics</span>
                Insights
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

