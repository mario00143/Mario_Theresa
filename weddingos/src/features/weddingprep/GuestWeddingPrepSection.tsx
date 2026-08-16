import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { useUI } from '@/context/UIContext';

/**
 * Read-only wedding-prep summary for a guest — surfaces any ceremony role,
 * attire profile, or gift plan already linked to this guest via
 * `linkedGuestId`, without duplicating any guest fields.
 */
export function GuestWeddingPrepSection({ guestId }: { guestId: string }) {
  const { ceremonyParticipants } = useCeremonyParticipants();
  const { attireProfiles } = useAttireProfiles();
  const { giftPlans } = useGiftPlans();
  const { closeGuestDetail } = useUI();
  const navigate = useNavigate();

  const participant = ceremonyParticipants.find((p) => p.linkedGuestId === guestId);
  const attireProfile = attireProfiles.find((p) => p.linkedGuestId === guestId);
  const giftPlan = giftPlans.find((p) => p.linkedGuestId === guestId);

  if (!participant && !attireProfile && !giftPlan) {
    return <p className="text-xs text-ink-faint">Not linked to any ceremony role, attire profile, or gift plan.</p>;
  }

  const goTo = (path: string) => {
    closeGuestDetail();
    navigate(path);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {participant && (
        <button type="button" onClick={() => goTo('/wedding-prep/ceremony')}>
          <Badge tone="info">Ceremony role: {participant.role}</Badge>
        </button>
      )}
      {attireProfile && (
        <button type="button" onClick={() => goTo('/wedding-prep/attire')}>
          <Badge tone="info">
            Attire: {attireProfile.personRole} — {attireProfile.status}
          </Badge>
        </button>
      )}
      {giftPlan && (
        <button type="button" onClick={() => goTo('/wedding-prep/gifts-kits')}>
          <Badge tone="info">Gift: {giftPlan.giftType}</Badge>
        </button>
      )}
    </div>
  );
}
