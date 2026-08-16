import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { useVendorDayStatusForVendor } from '@/hooks/useVendorDayStatuses';
import { useUI } from '@/context/UIContext';

/**
 * Read-only wedding-day status for a vendor — surfaces the day-of tracking
 * status if this vendor is being tracked, referencing VendorDayStatus
 * rather than duplicating any vendor contact/category data.
 */
export function VendorWeddingDaySection({ vendorId }: { vendorId: string }) {
  const status = useVendorDayStatusForVendor(vendorId);
  const { closeVendorDetail } = useUI();
  const navigate = useNavigate();

  if (!status) {
    return <p className="text-xs text-ink-faint">Not yet tracked on the wedding-day vendor board.</p>;
  }

  return (
    <button
      type="button"
      onClick={() => {
        closeVendorDetail();
        navigate('/wedding-day/vendors');
      }}
    >
      <Badge tone={status.status === 'No Show' || status.status === 'Delayed' ? 'critical' : 'info'}>Day-of status: {status.status}</Badge>
    </button>
  );
}
