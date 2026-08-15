import { MapPin } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { useSettings } from '@/hooks/useSettings';
import { getCountdown } from '@/utils/countdown';
import { formatDisplayDate } from '@/utils/date';

export function EventCards() {
  const { settings } = useSettings();
  const engagementCountdown = getCountdown(settings.engagement.date);
  const weddingCountdown = getCountdown(settings.wedding.date);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="overflow-hidden">
        <CardBody className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Engagement</p>
          <p className="mt-1 text-xl font-semibold text-ink">{formatDisplayDate(settings.engagement.date)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {settings.engagement.location}
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">{engagementCountdown.label}</p>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardBody className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Wedding</p>
          <p className="mt-1 text-xl font-semibold text-ink">{formatDisplayDate(settings.wedding.date)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {settings.wedding.location}
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">{weddingCountdown.label}</p>
        </CardBody>
      </Card>
    </div>
  );
}
