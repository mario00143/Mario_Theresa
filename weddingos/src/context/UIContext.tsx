import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface UIContextValue {
  selectedTaskId: string | null;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;

  selectedDecisionId: string | null;
  openDecisionDetail: (decisionId: string) => void;
  closeDecisionDetail: () => void;

  quickAddOpen: boolean;
  quickAddMode: 'task' | 'decision';
  openQuickAdd: (mode?: 'task' | 'decision') => void;
  closeQuickAdd: () => void;

  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<'task' | 'decision'>('task');
  const [searchOpen, setSearchOpen] = useState(false);

  const openTaskDetail = useCallback((taskId: string) => setSelectedTaskId(taskId), []);
  const closeTaskDetail = useCallback(() => setSelectedTaskId(null), []);

  const openDecisionDetail = useCallback((decisionId: string) => setSelectedDecisionId(decisionId), []);
  const closeDecisionDetail = useCallback(() => setSelectedDecisionId(null), []);

  const openQuickAdd = useCallback((mode: 'task' | 'decision' = 'task') => {
    setQuickAddMode(mode);
    setQuickAddOpen(true);
  }, []);
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), []);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const value = useMemo(
    () => ({
      selectedTaskId,
      openTaskDetail,
      closeTaskDetail,
      selectedDecisionId,
      openDecisionDetail,
      closeDecisionDetail,
      quickAddOpen,
      quickAddMode,
      openQuickAdd,
      closeQuickAdd,
      searchOpen,
      openSearch,
      closeSearch,
    }),
    [
      selectedTaskId,
      openTaskDetail,
      closeTaskDetail,
      selectedDecisionId,
      openDecisionDetail,
      closeDecisionDetail,
      quickAddOpen,
      quickAddMode,
      openQuickAdd,
      closeQuickAdd,
      searchOpen,
      openSearch,
      closeSearch,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within a UIProvider');
  return ctx;
}
