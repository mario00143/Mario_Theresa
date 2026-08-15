import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { computeGuestOverview } from '@/utils/guestStats';
import { detectDataIssues } from '@/utils/guestDataQuality';

export function GuestOverviewView() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const stats = computeGuestOverview(households, guests);
  const issues = detectDataIssues(households, guests);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Households &amp; guests</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Total households" value={stats.totalHouseholds} />
          <StatTile label="Total guests" value={stats.totalGuests} />
          <StatTile label="Groom-side guests" value={stats.groomSideGuests} />
          <StatTile label="Bride-side guests" value={stats.brideSideGuests} />
          <StatTile label="Wedding invitees" value={stats.weddingInvitees} />
          <StatTile label="Engagement invitees" value={stats.engagementInvitees} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RSVP — Wedding</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Attending" value={stats.rsvpAttending} tone="success" />
          <StatTile label="Declined" value={stats.rsvpDeclined} />
          <StatTile label="Pending / No response" value={stats.rsvpPendingOrNoResponse} tone={stats.rsvpPendingOrNoResponse > 0 ? 'warning' : 'default'} />
          <StatTile label="Adults attending" value={stats.adultsAttending} />
          <StatTile label="Children attending" value={stats.childrenAttending} />
          <StatTile label="Infants attending" value={stats.infantsAttending} />
          <StatTile label="Vegetarian attending" value={stats.vegetarianAttending} />
          <StatTile label="Non-vegetarian attending" value={stats.nonVegetarianAttending} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logistics</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Accommodation requested" value={stats.accommodationRequested} />
          <StatTile label="Pickup requested" value={stats.pickupRequested} />
          <StatTile label="Accessibility assistance required" value={stats.accessibilityAssistanceRequired} />
        </CardBody>
      </Card>

      <Link to="/guests/reports" className="block">
        <Card className={issues.length > 0 ? 'border-warning/40' : undefined}>
          <CardBody className="flex items-center gap-3">
            <TriangleAlert className={`size-5 shrink-0 ${issues.length > 0 ? 'text-warning' : 'text-ink-faint'}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink">Guest data issues</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {issues.length === 0 ? 'No data quality issues found.' : `${issues.length} issue${issues.length === 1 ? '' : 's'} to review — see Reports.`}
              </p>
            </div>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
