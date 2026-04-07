'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // A simple overlay menu to emulate the "hamburger" drawer
  return (
    <>
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 mt-2">
        <button 
          onClick={toggleMenu} 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[#6C6861]">menu</span>
        </button>

        <div className="flex-1 flex justify-center items-center gap-2">
          {/* Logo Centered */}
          <span className="material-symbols-outlined text-primary">psychiatry</span>
          <h1 className="text-lg font-bold text-on-surface tracking-tight">
            Second Brain
          </h1>
        </div>

        <div className="w-10 h-10 flex items-center justify-center">
          {/* Spacer to keep center balanced, could hold profile image */}
           <span className="material-symbols-outlined text-on-surface-variant">person</span>
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex animate-fade-in-up">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleMenu} />
          <nav className="relative w-64 bg-surface h-full shadow-2xl p-6 flex flex-col space-y-6 transform transition-transform animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg text-on-surface">Menu</span>
              <button onClick={toggleMenu}>
                <span className="material-symbols-outlined text-outline-variant">close</span>
              </button>
            </div>
            <Link href="/" className="flex items-center gap-3 text-primary font-bold"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span> Home</Link>
            <Link href="/ideas" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">lightbulb</span> Ideas</Link>
            <Link href="/tasks" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">task_alt</span> Tasks</Link>
            <Link href="/shopping" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">shopping_cart</span> Shopping</Link>
            <Link href="/workout" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">fitness_center</span> Gym</Link>
            <div className="flex-1" />
            <Link href="/settings" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">settings</span> Settings</Link>
          </nav>
        </div>
      )}
    </>
  );
}
