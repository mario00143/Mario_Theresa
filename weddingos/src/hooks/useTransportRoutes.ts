import { useCallback } from 'react';
import type { TransportRoute } from '@/types';
import { transportRoutesStore } from '@/data/stores';
import {
  addTransportRoute,
  deleteTransportRoute,
  updateTransportRoute,
  type NewTransportRouteInput,
} from '@/data/repositories/transportRouteRepository';
import { useStoreValue } from './useStore';

export function useTransportRoutes() {
  const routes = useStoreValue(transportRoutesStore);

  return {
    routes,
    addTransportRoute: useCallback((input: NewTransportRouteInput) => addTransportRoute(input), []),
    updateTransportRoute: useCallback(
      (id: string, patch: Partial<Omit<TransportRoute, 'id' | 'createdAt'>>) => updateTransportRoute(id, patch),
      [],
    ),
    deleteTransportRoute: useCallback((id: string) => deleteTransportRoute(id), []),
  };
}

export function useTransportRoute(id: string | undefined): TransportRoute | undefined {
  const routes = useStoreValue(transportRoutesStore);
  return id ? routes.find((r) => r.id === id) : undefined;
}
