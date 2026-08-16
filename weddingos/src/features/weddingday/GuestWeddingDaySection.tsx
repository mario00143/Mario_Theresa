import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { useGuestOperationalStatusForGuest } from '@/hooks/useGuestOperationalStatuses';
import { useUI } from '@/context/UIContext';

/**
 * Read-only wedding-day operational summary for a guest — surfaces the
 * lightweight VIP/elderly/accessibility tracking status if this guest is
 * one of the small set being tracked, without duplicating any guest fields.
 */
export function GuestWeddingDaySection({ guestId }: { guestId: string }) {
  const status = useGuestOperationalStatusForGuest(guestId);
  const { closeGuestDetail } = useUI();
  const navigate = useNavigate();

  if (!status) {
    return <p className="text-xs text-ink-faint">Not tracked for wedding-day operational status (VIPs, elderly, and accessibility cases only).</p>;
  }

  return (
    <button
      type="button"
      onClick={() => {
        closeGuestDetail();
        navigate('/wedding-day/manifests');
      }}
    >
      <Badge tone={status.state === 'Assistance Required' ? 'critical' : 'info'}>
        {status.isVip ? 'VIP — ' : ''}
        {status.state}
      </Badge>
    </button>
  );
}
