'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary-container/30 blur-[100px] pointer-events-none" />

      <main className="w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <header className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 mb-6 flex items-center justify-center bg-surface-container-lowest rounded-xl soft-shadow">
            <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Second Brain
          </h1>
          <p className="text-on-surface-variant font-medium text-center max-w-[280px]">
            Access your curated digital sanctuary and serene thoughts.
          </p>
        </header>

        {/* Login/Register Container */}
        <div className="glass-card rounded-xl p-8 soft-shadow border border-white/40">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase px-1" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-14 px-6 bg-surface-container-low text-on-surface rounded-lg border-0 ring-0 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant outline-none"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
              </div>
            </div>

            {/* PIN Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase" htmlFor="pin">
                  6-Digit PIN
                </label>
                {isLogin && (
                  <button className="text-xs font-semibold text-primary hover:opacity-70 transition-opacity" type="button">
                    Forgot PIN?
                  </button>
                )}
              </div>
              <div className="relative group">
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(val);
                  }}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full h-14 px-6 bg-surface-container-low text-on-surface rounded-lg border-0 ring-0 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant tracking-[0.5em] outline-none"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none">
                  <span className="material-symbols-outlined">lock</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-error text-sm font-medium text-center bg-error-container/10 p-3 rounded-lg animate-fade-in-up">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-gradient-primary text-on-primary font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-on-surface-variant text-sm">
              {isLogin ? "New here? " : "Already have an account? "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-primary font-bold hover:underline underline-offset-4"
              >
                {isLogin ? 'Create your Brain' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">encrypted</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">End-to-End Encrypted</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-on-surface-variant" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">cloud_off</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">Privacy First</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
