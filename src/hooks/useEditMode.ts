import { useState, useCallback } from 'react';

export type ViewMode = 'view' | 'edit';

export interface UseEditModeReturn {
  mode: ViewMode;
  isEditMode: boolean;
  enterEditMode: () => void;
  exitEditMode: () => void;
  setMode: (mode: ViewMode) => void;
}

export function useEditMode(initialMode: ViewMode = 'view'): UseEditModeReturn {
  const [mode, setMode] = useState<ViewMode>(initialMode);

  const isEditMode = mode === 'edit';

  const enterEditMode = useCallback(() => {
    setMode('edit');
  }, []);

  const exitEditMode = useCallback(() => {
    setMode('view');
  }, []);

  return {
    mode,
    isEditMode,
    enterEditMode,
    exitEditMode,
    setMode,
  };
}
