import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { computeRsvpReport, type RsvpReportRow } from '@/utils/guestStats';

function RsvpRowStats({ row }: { row: RsvpReportRow }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-6">
      <Stat label="Total" value={row.total} />
      <Stat label="Attending" value={row.attending} />
      <Stat label="Declined" value={row.declined} />
      <Stat label="Maybe" value={row.maybe} />
      <Stat label="Pending" value={row.pending} />
      <Stat label="No response" value={row.noResponse} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-subtle px-2.5 py-2">
      <p className="text-ink-faint">{label}</p>
      <p className="text-sm font-semibold text-ink tabular-nums">{value}</p>
    </div>
  );
}

export function RsvpReportPanel() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const report = computeRsvpReport(guests, households);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>RSVP report — overall</CardTitle>
        </CardHeader>
        <CardBody>
          <RsvpRowStats row={report.overall} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By event</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {(Object.keys(report.byEvent) as (keyof typeof report.byEvent)[]).map((event) => (
            <div key={event}>
              <p className="text-sm font-medium text-ink mb-1.5">{event}</p>
              <RsvpRowStats row={report.byEvent[event]} />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By side</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {(Object.keys(report.bySide) as (keyof typeof report.bySide)[]).map((side) => (
            <div key={side}>
              <p className="text-sm font-medium text-ink mb-1.5">{side}</p>
              <RsvpRowStats row={report.bySide[side]} />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
