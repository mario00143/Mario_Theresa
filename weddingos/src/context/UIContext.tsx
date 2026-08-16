import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type QuickAddMode =
  | 'task'
  | 'decision'
  | 'household'
  | 'guest'
  | 'travel'
  | 'hotel'
  | 'route'
  | 'vendor'
  | 'budgetItem'
  | 'payment'
  | 'churchRequirement'
  | 'ceremonyItem'
  | 'giftPlan';

interface UIContextValue {
  selectedTaskId: string | null;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;

  selectedDecisionId: string | null;
  openDecisionDetail: (decisionId: string) => void;
  closeDecisionDetail: () => void;

  selectedHouseholdId: string | null;
  openHouseholdDetail: (householdId: string) => void;
  closeHouseholdDetail: () => void;

  selectedGuestId: string | null;
  openGuestDetail: (guestId: string) => void;
  closeGuestDetail: () => void;

  selectedTravelSegmentId: string | null;
  openTravelDetail: (travelSegmentId: string) => void;
  closeTravelDetail: () => void;

  selectedVendorId: string | null;
  openVendorDetail: (vendorId: string) => void;
  closeVendorDetail: () => void;

  quickAddOpen: boolean;
  quickAddMode: QuickAddMode;
  openQuickAdd: (mode?: QuickAddMode) => void;
  closeQuickAdd: () => void;

  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTravelSegmentId, setSelectedTravelSegmentId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<QuickAddMode>('task');
  const [searchOpen, setSearchOpen] = useState(false);

  const openTaskDetail = useCallback((taskId: string) => setSelectedTaskId(taskId), []);
  const closeTaskDetail = useCallback(() => setSelectedTaskId(null), []);

  const openDecisionDetail = useCallback((decisionId: string) => setSelectedDecisionId(decisionId), []);
  const closeDecisionDetail = useCallback(() => setSelectedDecisionId(null), []);

  const openHouseholdDetail = useCallback((householdId: string) => setSelectedHouseholdId(householdId), []);
  const closeHouseholdDetail = useCallback(() => setSelectedHouseholdId(null), []);

  const openGuestDetail = useCallback((guestId: string) => setSelectedGuestId(guestId), []);
  const closeGuestDetail = useCallback(() => setSelectedGuestId(null), []);

  const openTravelDetail = useCallback((travelSegmentId: string) => setSelectedTravelSegmentId(travelSegmentId), []);
  const closeTravelDetail = useCallback(() => setSelectedTravelSegmentId(null), []);

  const openVendorDetail = useCallback((vendorId: string) => setSelectedVendorId(vendorId), []);
  const closeVendorDetail = useCallback(() => setSelectedVendorId(null), []);

  const openQuickAdd = useCallback((mode: QuickAddMode = 'task') => {
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
      selectedHouseholdId,
      openHouseholdDetail,
      closeHouseholdDetail,
      selectedGuestId,
      openGuestDetail,
      closeGuestDetail,
      selectedTravelSegmentId,
      openTravelDetail,
      closeTravelDetail,
      selectedVendorId,
      openVendorDetail,
      closeVendorDetail,
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
      selectedHouseholdId,
      openHouseholdDetail,
      closeHouseholdDetail,
      selectedGuestId,
      openGuestDetail,
      closeGuestDetail,
      selectedTravelSegmentId,
      openTravelDetail,
      closeTravelDetail,
      selectedVendorId,
      openVendorDetail,
      closeVendorDetail,
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
