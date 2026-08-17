import type { Decision } from '@/types';
import { generateSeedId } from '@/lib/id';

interface DecisionSeed {
  title: string;
  description: string;
  category: string;
  owner: string;
  approver?: string;
  options: string[];
  recommendedOption?: string;
  deadline?: string;
  status: Decision['status'];
  finalDecision?: string;
  decisionDate?: string;
  notes?: string;
  createdDaysAgo?: number;
  relatedTaskKey?: string;
}

const NOW = new Date('2026-08-15T09:00:00.000Z');
function daysAgoISO(days: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

const seeds: DecisionSeed[] = [
  {
    title: 'Confirm Christian denomination',
    description: 'Confirm the denomination that will govern ceremony requirements and documentation.',
    category: 'Church & Legal',
    owner: 'Church Lead',
    approver: 'Groom Father',
    options: ['Roman Catholic', 'Syro-Malabar', 'Syro-Malankara'],
    recommendedOption: 'Syro-Malabar',
    deadline: '2026-08-20',
    status: 'Decided',
    finalDecision: 'Syro-Malabar Catholic',
    decisionDate: '2026-08-12',
    createdDaysAgo: 42,
    relatedTaskKey: 'church-denomination',
  },
  {
    title: 'Select wedding church',
    description: 'Select the parish church in Hyderabad for the ceremony on 30 January 2027.',
    category: 'Church & Legal',
    owner: 'Church Lead',
    approver: 'Groom Father',
    options: ['St. Mary\'s Basilica, Secunderabad', 'Sacred Heart Church, Hyderabad'],
    recommendedOption: 'St. Mary\'s Basilica, Secunderabad',
    deadline: '2026-09-30',
    status: 'Under Discussion',
    createdDaysAgo: 30,
  },
  {
    title: 'Select reception venue',
    description: 'Select the reception venue in Hyderabad based on site visit findings.',
    category: 'Venue',
    owner: 'Groom Father',
    approver: 'Groom',
    options: ['Lakeside Convention Centre', 'Grand Ballroom Hyderabad', 'Garden Court Banquets'],
    deadline: '2026-09-15',
    status: 'Open',
    createdDaysAgo: 25,
  },
  {
    title: 'Set maximum guest count',
    description: 'Agree the final maximum guest count ceiling across both families.',
    category: 'Guests',
    owner: 'Groom Father',
    approver: 'Bride',
    options: ['400', '450', '500'],
    recommendedOption: '450',
    deadline: '2026-08-10',
    status: 'Open',
    createdDaysAgo: 20,
    notes: 'Overdue — needs urgent resolution to unblock venue and catering headcounts.',
    relatedTaskKey: 'guests-max-count',
  },
  {
    title: 'Approve wedding budget ceiling',
    description: 'Approve the overall budget ceiling for both engagement and wedding.',
    category: 'Budget',
    owner: 'Finance Lead',
    approver: 'Groom Father',
    options: ['INR 40,00,000', 'INR 45,00,000', 'INR 50,00,000'],
    recommendedOption: 'INR 45,00,000',
    deadline: '2026-08-20',
    status: 'Decided',
    finalDecision: 'INR 45,00,000 overall ceiling',
    decisionDate: '2026-08-10',
    createdDaysAgo: 40,
    relatedTaskKey: 'gov-budget-ceiling',
  },
  {
    title: 'Decide printed vs digital invitations',
    description: 'Decide whether invitations will be printed only, digital only, or both.',
    category: 'Invitations',
    owner: 'Bride',
    options: ['Printed only', 'Digital only', 'Both'],
    recommendedOption: 'Both',
    deadline: '2026-09-30',
    status: 'Open',
    createdDaysAgo: 15,
  },
  {
    title: 'Select primary hotel',
    description: 'Select the primary hotel for the Hyderabad wedding guest room block.',
    category: 'Accommodation',
    owner: 'Accommodation Lead',
    options: ['Hotel Aurora Hyderabad', 'The Regency Suites', 'Skyline Grand Hotel'],
    deadline: '2026-09-30',
    status: 'Open',
    createdDaysAgo: 15,
  },
  {
    title: 'Decide photography package',
    description: 'Decide on the photography and videography package level.',
    category: 'Photography & Video',
    owner: 'Bride',
    options: ['Photo only', 'Photo + traditional video', 'Photo + cinematic video'],
    recommendedOption: 'Photo + cinematic video',
    deadline: '2026-09-30',
    status: 'Under Discussion',
    createdDaysAgo: 12,
  },
  {
    title: 'Finalize ceremony attire style',
    description: 'Decide on the overall style direction for groom and bride ceremony attire.',
    category: 'Attire',
    owner: 'Groom',
    options: ['Traditional Kerala Christian', 'Contemporary fusion', 'Classic Western formal'],
    recommendedOption: 'Traditional Kerala Christian',
    deadline: '2026-10-31',
    status: 'Open',
    createdDaysAgo: 10,
  },
  {
    title: 'Decide reception meal format',
    description: 'Decide the meal service format for the reception.',
    category: 'Catering',
    owner: 'Groom Mother',
    options: ['Sit-down plated', 'Buffet', 'Live counters + buffet'],
    recommendedOption: 'Live counters + buffet',
    deadline: '2026-10-15',
    status: 'Open',
    createdDaysAgo: 10,
  },
];

export function buildSeedDecisions(taskIdByKey: Map<string, string>): Decision[] {
  return seeds.map((seed) => {
    const createdAt = daysAgoISO(seed.createdDaysAgo ?? 20);
    return {
      id: generateSeedId('decision', seed.title),
      title: seed.title,
      description: seed.description,
      category: seed.category,
      owner: seed.owner,
      approver: seed.approver,
      options: seed.options,
      recommendedOption: seed.recommendedOption,
      deadline: seed.deadline,
      status: seed.status,
      finalDecision: seed.finalDecision,
      decisionDate: seed.decisionDate,
      notes: seed.notes,
      relatedTaskId: seed.relatedTaskKey ? taskIdByKey.get(seed.relatedTaskKey) : undefined,
      createdAt,
      updatedAt: seed.decisionDate ? new Date(seed.decisionDate).toISOString() : createdAt,
    };
  });
}
