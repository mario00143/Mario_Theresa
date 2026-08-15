import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useHouseholds } from '@/hooks/useHouseholds';
import { computeInvitationReport } from '@/utils/guestStats';

export function InvitationReportPanel() {
  const { households } = useHouseholds();
  const report = computeInvitationReport(households);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation report</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Total households" value={report.total} />
        {(Object.keys(report.byStatus) as (keyof typeof report.byStatus)[]).map((status) => (
          <StatTile key={status} label={status} value={report.byStatus[status]} />
        ))}
      </CardBody>
    </Card>
  );
}
