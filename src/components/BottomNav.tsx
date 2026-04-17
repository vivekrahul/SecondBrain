'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

const ALL_NAV_ITEMS = [
  { href: '/',         icon: 'home',             label: 'Home',     key: 'home',     modes: ['home', 'work'] },
  { href: '/ideas',   icon: 'lightbulb',         label: 'Ideas',    key: 'ideas',    modes: ['home', 'work'] },
  { href: '/focus',   icon: 'self_improvement',  label: 'Focus',    key: 'focus',    modes: ['home', 'work'] },
  { href: '/shopping',icon: 'shopping_cart',     label: 'Shop',     key: 'shopping', modes: ['home'] },
  { href: '/tasks',   icon: 'task_alt',          label: 'Tasks',    key: 'tasks',    modes: ['home', 'work'] },
  { href: '/logs',    icon: 'history',           label: 'Logs',     key: 'logs',     modes: ['work'] },
];

export default function BottomNav({ hiddenTabs = [] }: { hiddenTabs?: string[] }) {
  const pathname = usePathname();
  const { mode } = useWorkspace();

  const visibleItems = ALL_NAV_ITEMS.filter(item =>
    item.modes.includes(mode) &&
    !hiddenTabs.includes(item.key)
  );

  return (
    <nav className="fixed bottom-0 w-full z-50 pointer-events-none md:hidden">
      <div className="bg-surface border-t border-surface-variant/50 mx-auto px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex justify-around items-center pointer-events-auto">
        {visibleItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 min-w-[52px] ${
                isActive ? 'text-primary' : 'text-on-surface-variant/60'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
