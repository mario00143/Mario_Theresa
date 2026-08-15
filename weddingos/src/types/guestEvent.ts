/**
 * Phase 2 uses a focused two-event set (independent of Task's EventScope,
 * which also allows "Both" as a single value) because households/guests
 * need an actual array of which specific events they're invited to.
 */
export const GUEST_EVENTS = ['Engagement', 'Wedding'] as const;
export type GuestEvent = (typeof GUEST_EVENTS)[number];
