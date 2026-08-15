import { useCallback } from 'react';
import type { RoomAssignment } from '@/types';
import { roomAssignmentsStore } from '@/data/stores';
import {
  addRoomAssignment,
  deleteRoomAssignment,
  updateRoomAssignment,
  type NewRoomAssignmentInput,
} from '@/data/repositories/roomAssignmentRepository';
import { useStoreValue } from './useStore';

export function useRoomAssignments() {
  const roomAssignments = useStoreValue(roomAssignmentsStore);

  return {
    roomAssignments,
    addRoomAssignment: useCallback((input: NewRoomAssignmentInput) => addRoomAssignment(input), []),
    updateRoomAssignment: useCallback(
      (id: string, patch: Partial<Omit<RoomAssignment, 'id' | 'createdAt'>>) => updateRoomAssignment(id, patch),
      [],
    ),
    deleteRoomAssignment: useCallback((id: string) => deleteRoomAssignment(id), []),
  };
}

export function useRoomAssignmentsForGuest(guestId: string | undefined): RoomAssignment[] {
  const roomAssignments = useStoreValue(roomAssignmentsStore);
  return guestId ? roomAssignments.filter((a) => a.guestId === guestId) : [];
}

export function useRoomAssignmentsForRoom(roomId: string | undefined): RoomAssignment[] {
  const roomAssignments = useStoreValue(roomAssignmentsStore);
  return roomId ? roomAssignments.filter((a) => a.roomId === roomId) : [];
}
