'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/ideas', icon: 'lightbulb', label: 'Ideas' },
  { href: '/shopping', icon: 'shopping_cart', label: 'Shopping' },
  { href: '/workout', icon: 'fitness_center', label: 'Gym' },
  { href: '/tasks', icon: 'work', label: 'Tasks' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-center pb-8 pointer-events-none md:hidden animate-fade-in-up md:animate-none">
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_32px_64px_rgba(46,47,47,0.06)] fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-[3rem] px-4 py-3 flex justify-between items-center pointer-events-auto">
        {navItems.map((item) => {
          // Exact match for home, startsWith for other routes
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center transition-all active:scale-90 duration-300 tap-highlight-transparent ${
                isActive
                  ? 'bg-gradient-to-br from-[#5f4ea5] to-[#b3a1ff] text-white rounded-full w-12 h-12 shadow-lg shadow-primary/20 scale-100'
                  : 'text-[#5b5c5b] dark:text-zinc-400 w-12 h-12 hover:scale-110 scale-95 opacity-80 hover:opacity-100'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
