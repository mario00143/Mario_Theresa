import type { AttireProfile, CateringPlan, ChurchProfile, ChurchRequirement, DecorPlan, GroomingAppointment, MusicAVPlan, PhotographyPlan } from '@/types';
import { CHURCH_REQUIREMENT_DONE_STATUSES } from '@/types';

export interface WeddingPrepKeyDate {
  id: string;
  date: string;
  label: string;
  route: string;
}

function isRequirementDone(status: ChurchRequirement['status']): boolean {
  return (CHURCH_REQUIREMENT_DONE_STATUSES as readonly string[]).includes(status);
}

/** Key wedding-prep dates surfaced on the Calendar, alongside tasks — not stored as tasks themselves. */
export function buildWeddingPrepKeyDates(
  churchProfiles: ChurchProfile[],
  churchRequirements: ChurchRequirement[],
  cateringPlans: CateringPlan[],
  decorPlans: DecorPlan[],
  attireProfiles: AttireProfile[],
  groomingAppointments: GroomingAppointment[],
  photographyPlans: PhotographyPlan[],
  musicAVPlans: MusicAVPlan[],
): WeddingPrepKeyDate[] {
  const dates: WeddingPrepKeyDate[] = [];

  for (const church of churchProfiles) {
    if (church.rehearsalDate) {
      dates.push({ id: `church-rehearsal-${church.id}`, date: church.rehearsalDate, label: 'Ceremony rehearsal', route: '/wedding-prep/church' });
    }
  }

  for (const req of churchRequirements) {
    if (req.applicability === 'Applicable' && req.dueDate && !isRequirementDone(req.status)) {
      dates.push({ id: `church-req-${req.id}`, date: req.dueDate, label: `Church requirement due: ${req.title}`, route: '/wedding-prep/church' });
    }
  }

  for (const plan of cateringPlans) {
    if (plan.finalCountDueDate) {
      dates.push({ id: `catering-final-${plan.id}`, date: plan.finalCountDueDate, label: `${plan.event} catering final count due`, route: '/wedding-prep/catering' });
    }
  }

  for (const plan of decorPlans) {
    if (plan.installDate) {
      dates.push({ id: `decor-install-${plan.id}`, date: plan.installDate, label: `Décor install: ${plan.area}`, route: '/wedding-prep/decor' });
    }
  }

  for (const profile of attireProfiles) {
    if (profile.finalFittingDate) {
      dates.push({ id: `attire-fitting-${profile.id}`, date: profile.finalFittingDate, label: `Final fitting: ${profile.personRole}`, route: '/wedding-prep/attire' });
    }
  }

  for (const appt of groomingAppointments) {
    if (appt.date) {
      dates.push({ id: `grooming-${appt.id}`, date: appt.date, label: `${appt.type}: ${appt.personRole}`, route: '/wedding-prep/attire' });
    }
  }

  for (const plan of photographyPlans) {
    if (plan.deliveryDueDate) {
      dates.push({ id: `photo-delivery-${plan.id}`, date: plan.deliveryDueDate, label: `${plan.event} photo/video delivery due`, route: '/wedding-prep/photo-video' });
    }
  }

  for (const plan of musicAVPlans) {
    if (plan.soundcheckDate) {
      dates.push({ id: `soundcheck-${plan.id}`, date: plan.soundcheckDate, label: `${plan.event} soundcheck`, route: '/wedding-prep/music-av' });
    }
  }

  return dates;
}
