'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { BrainDump } from '@/lib/types';

type Phase = 'select' | 'session' | 'done';
type TimerPreset = 15 | 25 | 45;

export default function FocusSession({
  tasks,
  ideas,
}: {
  tasks: BrainDump[];
  ideas: BrainDump[];
}) {
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedItem, setSelectedItem] = useState<BrainDump | null>(null);
  const [customText, setCustomText] = useState('');
  const [timerMinutes, setTimerMinutes] = useState<TimerPreset>(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Wake Lock — acquire when session starts running, release when paused/done
  const acquireWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);
      wakeLockRef.current.addEventListener('release', () => {
        setWakeLockActive(false);
      });
    } catch {
      // Wake Lock may be denied (e.g. battery saver mode) — fail silently
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  }, []);

  // Re-acquire wake lock if page visibility changes (e.g. user switches tabs momentarily)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, acquireWakeLock]);

  // Manage wake lock when running state changes
  useEffect(() => {
    if (isRunning) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isRunning, acquireWakeLock, releaseWakeLock]);

  // Timer logic
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setPhase('done');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft]);

  // Ambient audio
  useEffect(() => {
    audioRef.current = new Audio('/audio/ambient-rain.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggleAmbient = useCallback(() => {
    if (!audioRef.current) return;
    if (isAmbientPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsAmbientPlaying(!isAmbientPlaying);
  }, [isAmbientPlaying]);

  const startSession = useCallback((item: BrainDump | null, text?: string) => {
    setSelectedItem(item);
    if (text) setCustomText(text);
    setSecondsLeft(timerMinutes * 60);
    setPhase('session');
  }, [timerMinutes]);

  const startFreeSession = useCallback(() => {
    setSelectedItem(null);
    setCustomText('');
    setSecondsLeft(timerMinutes * 60);
    setPhase('session');
  }, [timerMinutes]);

  const exitSession = useCallback(() => {
    setIsRunning(false);
    releaseWakeLock();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAmbientPlaying(false);
    }
    setPhase('select');
  }, [releaseWakeLock]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = 1 - secondsLeft / (timerMinutes * 60);
  const focusText = selectedItem
    ? (selectedItem.clean_text || selectedItem.raw_text)
    : (customText || 'Deep focus session');

  // ========== SELECTION PHASE ==========
  if (phase === 'select') {
    return (
      <div className="max-w-lg mx-auto px-6 pt-6 pb-40 animate-page-enter">
        <section className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              self_improvement
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Focus Mode</h1>
          <p className="text-on-surface-variant text-sm">Pick something to focus on, or just start a timer.</p>
        </section>

        {/* Timer Preset Selector */}
        <div className="flex justify-center gap-3 mb-10">
          {([15, 25, 45] as TimerPreset[]).map((mins) => (
            <button
              key={mins}
              onClick={() => setTimerMinutes(mins)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                timerMinutes === mins
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Free Focus Button */}
        <button
          onClick={startFreeSession}
          className="w-full mb-8 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-center hover:bg-primary/20 transition-colors flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined">timer</span>
          Start Pomodoro ({timerMinutes} min)
        </button>

        {/* Tasks */}
        {tasks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Tasks to focus on</h2>
            <div className="space-y-3">
              {tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startSession(t)}
                  className="w-full text-left cozy-card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary-container/40 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary text-lg">task_alt</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface line-clamp-2 break-words">{t.clean_text || t.raw_text}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Ideas */}
        {ideas.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Ideas to explore</h2>
            <div className="space-y-3">
              {ideas.map((i) => (
                <button
                  key={i.id}
                  onClick={() => startSession(i)}
                  className="w-full text-left cozy-card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-container/40 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-lg">lightbulb</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface line-clamp-2 break-words">{i.clean_text || i.raw_text}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ========== DONE PHASE ==========
  if (phase === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-6 animate-page-enter">
        <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Well done.</h1>
        <p className="text-on-surface-variant text-center mb-8 max-w-xs">
          You spent {timerMinutes} minutes in deep focus. Your mind thanks you.
        </p>
        <button
          onClick={exitSession}
          className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold shadow-md active:scale-95 transition-transform"
        >
          Back to Focus
        </button>
      </div>
    );
  }

  // ========== SESSION PHASE ==========
  return (
    <div className="fixed inset-0 z-[90] bg-surface flex flex-col items-center justify-center focus-breathing">
      {/* Exit Button */}
      <button
        onClick={exitSession}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors z-10"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      {/* Wake Lock Indicator */}
      {wakeLockActive && (
        <div className="absolute top-6 left-6 flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Screen on
        </div>
      )}

      {/* Timer Ring */}
      <div className="relative w-56 h-56 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-surface-container"
          />
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={565.5}
            strokeDashoffset={565.5 * (1 - progressPercent)}
            className="text-primary transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-on-surface tabular-nums tracking-tight">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs font-medium text-on-surface-variant mt-1 uppercase tracking-widest">
            {isRunning ? 'Focusing' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Focus item text */}
      <p className="text-lg font-medium text-on-surface text-center max-w-sm px-6 mb-10 line-clamp-3">
        {focusText}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Ambient Toggle */}
        <button
          onClick={toggleAmbient}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isAmbientPlaying
              ? 'bg-secondary/20 text-secondary'
              : 'bg-surface-container text-on-surface-variant'
          }`}
          title="Ambient sound"
        >
          <span className="material-symbols-outlined" style={isAmbientPlaying ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            {isAmbientPlaying ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Reset */}
        <button
          onClick={() => { setIsRunning(false); setSecondsLeft(timerMinutes * 60); }}
          className="w-14 h-14 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center transition-all hover:bg-surface-container-high"
          title="Reset timer"
        >
          <span className="material-symbols-outlined">restart_alt</span>
        </button>
      </div>
    </div>
  );
}
