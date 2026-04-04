'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/ideas', icon: 'lightbulb', label: 'Ideas' },
  { href: '/shopping', icon: 'shopping_bag', label: 'Shopping' },
  { href: '/workout', icon: 'fitness_center', label: 'Gym' },
  { href: '/tasks', icon: 'task_alt', label: 'Tasks' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-center pb-8 pointer-events-none md:hidden">
      <div className="bg-white/70 backdrop-blur-2xl shadow-[0_32px_64px_rgba(46,47,47,0.06)] fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-[3rem] px-4 py-3 flex justify-between items-center pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center w-12 h-12 transition-transform active:scale-90 duration-300 tap-highlight-transparent ${
                isActive
                  ? 'bg-gradient-to-br from-[#5f4ea5] to-[#b3a1ff] text-white rounded-full shadow-lg shadow-primary/30'
                  : 'text-[#5b5c5b] hover:scale-110'
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
