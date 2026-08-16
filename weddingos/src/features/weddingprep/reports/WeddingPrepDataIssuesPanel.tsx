import { Link } from 'react-router-dom';
import { Download, TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useDecorPlans } from '@/hooks/useDecorPlans';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useAttireItems } from '@/hooks/useAttireItems';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import { usePhotoGroups } from '@/hooks/usePhotoGroups';
import { useMusicCues } from '@/hooks/useMusicCues';
import { useMusicAVPlans } from '@/hooks/useMusicAVPlans';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { useWelcomeKits } from '@/hooks/useWelcomeKits';
import { useGuests } from '@/hooks/useGuests';
import { useSettings } from '@/hooks/useSettings';
import { detectWeddingPrepIssues, type WeddingPrepLinkType } from '@/utils/weddingPrepDataQuality';
import { computeSuggestedCateringCounts } from '@/utils/cateringLogic';
import { weddingDateTimeISO } from '@/utils/date';
import { weddingPrepIssuesCsvFilename, weddingPrepIssuesToCSV } from '@/data/repositories/weddingPrepCsv';
import { downloadTextFile } from '@/utils/download';

const LINK_TYPE_TAB: Record<WeddingPrepLinkType, string> = {
  churchRequirement: '/wedding-prep/church',
  ceremonyParticipant: '/wedding-prep/ceremony',
  ceremonyItem: '/wedding-prep/ceremony-items',
  cateringPlan: '/wedding-prep/catering',
  decorPlan: '/wedding-prep/decor',
  attireProfile: '/wedding-prep/attire',
  photographyPlan: '/wedding-prep/photo-video',
  photoGroup: '/wedding-prep/photo-video',
  musicAVPlan: '/wedding-prep/music-av',
  giftPlan: '/wedding-prep/gifts-kits',
  welcomeKit: '/wedding-prep/gifts-kits',
};

export function WeddingPrepDataIssuesPanel() {
  const { churchProfiles } = useChurchProfiles();
  const { churchRequirements } = useChurchRequirements();
  const { ceremonyParticipants } = useCeremonyParticipants();
  const { ceremonyItems } = useCeremonyItems();
  const { cateringPlans } = useCateringPlans();
  const { menuItems } = useMenuItems();
  const { decorPlans } = useDecorPlans();
  const { attireProfiles } = useAttireProfiles();
  const { attireItems } = useAttireItems();
  const { photographyPlans } = usePhotographyPlans();
  const { photoGroups } = usePhotoGroups();
  const { musicCues } = useMusicCues();
  const { musicAVPlans } = useMusicAVPlans();
  const { giftPlans } = useGiftPlans();
  const { welcomeKits } = useWelcomeKits();
  const { guests } = useGuests();
  const { settings } = useSettings();

  const weddingDateTime = weddingDateTimeISO(settings);
  const suggested = computeSuggestedCateringCounts(guests, 'Wedding');

  const issues = detectWeddingPrepIssues({
    churchProfile: churchProfiles[0],
    churchRequirements,
    ceremonyParticipants,
    ceremonyItems,
    cateringPlans,
    menuItems,
    decorPlans,
    attireProfiles,
    attireItems,
    photographyPlans,
    photoGroups,
    musicCues,
    musicAVPlans,
    giftPlans,
    welcomeKits,
    weddingDateTimeISO: weddingDateTime,
    confirmedWeddingAttendance: suggested.confirmedAttendees,
    favorBuffer: 10,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wedding prep data issues</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{issues.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => downloadTextFile(weddingPrepIssuesCsvFilename(), weddingPrepIssuesToCSV(issues), 'text/csv')}
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {issues.length === 0 ? (
          <EmptyState title="No data quality issues" description="Church, ceremony, catering, décor, attire, photography, music, and gift records all pass the automated checks." />
        ) : (
          <ul className="divide-y divide-line-soft max-h-[36rem] overflow-y-auto">
            {issues.map((issue) => (
              <li key={issue.id}>
                <Link to={LINK_TYPE_TAB[issue.linkType]} className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-surface-subtle">
                  <TriangleAlert className="size-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
                  <span className="text-sm text-ink">{issue.message}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
