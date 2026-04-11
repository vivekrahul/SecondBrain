'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type WorkspaceMode = 'home' | 'work';

interface WorkspaceContextValue {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  mode: 'home',
  setMode: () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>('home');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sb-workspace-mode') as WorkspaceMode | null;
    const cookieMatch = document.cookie.match(/(?:^|;\s*)sb-workspace-mode=([^;]*)/);
    const existingCookie = cookieMatch ? cookieMatch[1] : null;

    if (stored === 'home' || stored === 'work') {
      setModeState(stored);
      // Sync to cookie if it's missing or mismatched
      if (existingCookie !== stored) {
        document.cookie = `sb-workspace-mode=${stored}; path=/; max-age=31536000`;
      }
    }
  }, []);

  const setMode = (newMode: WorkspaceMode) => {
    setModeState(newMode);
    localStorage.setItem('sb-workspace-mode', newMode);
    document.cookie = `sb-workspace-mode=${newMode}; path=/; max-age=31536000`;
  };

  return (
    <WorkspaceContext.Provider value={{ mode, setMode }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
