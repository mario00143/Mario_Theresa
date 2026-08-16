import { useState } from 'react';
import { addMonths, format, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useDecorPlans } from '@/hooks/useDecorPlans';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useGroomingAppointments } from '@/hooks/useGroomingAppointments';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import { useMusicAVPlans } from '@/hooks/useMusicAVPlans';
import { buildWeddingPrepKeyDates } from '@/utils/weddingPrepCalendar';
import { MonthView } from '@/features/calendar/MonthView';
import { AgendaView } from '@/features/calendar/AgendaView';

const WEDDING_MONTH_ANCHOR = new Date('2027-01-01T00:00:00');

export function CalendarPage() {
  const { tasks } = useTasks();
  const { churchProfiles } = useChurchProfiles();
  const { churchRequirements } = useChurchRequirements();
  const { cateringPlans } = useCateringPlans();
  const { decorPlans } = useDecorPlans();
  const { attireProfiles } = useAttireProfiles();
  const { groomingAppointments } = useGroomingAppointments();
  const { photographyPlans } = usePhotographyPlans();
  const { musicAVPlans } = useMusicAVPlans();
  const weddingPrepEvents = buildWeddingPrepKeyDates(
    churchProfiles, churchRequirements, cateringPlans, decorPlans, attireProfiles, groomingAppointments, photographyPlans, musicAVPlans,
  );
  const [view, setView] = useState<'month' | 'agenda'>('month');
  const [monthAnchor, setMonthAnchor] = useState(WEDDING_MONTH_ANCHOR);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Calendar</h1>
          <p className="text-sm text-ink-faint mt-0.5">Task due dates alongside the engagement and wedding.</p>
        </div>
        <div className="flex rounded-lg border border-line p-1">
          <button
            type="button"
            onClick={() => setView('month')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'month' ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setView('agenda')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'agenda' ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
          >
            Agenda
          </button>
        </div>
      </div>

      {view === 'month' && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="size-4" aria-hidden="true" />} onClick={() => setMonthAnchor((m) => subMonths(m, 1))} aria-label="Previous month" />
            <p className="text-sm font-semibold text-ink">{format(monthAnchor, 'MMMM yyyy')}</p>
            <Button variant="ghost" size="sm" icon={<ChevronRight className="size-4" aria-hidden="true" />} onClick={() => setMonthAnchor((m) => addMonths(m, 1))} aria-label="Next month" />
          </div>
          <MonthView monthAnchor={monthAnchor} tasks={tasks} weddingPrepEvents={weddingPrepEvents} />
        </>
      )}

      {view === 'agenda' && <AgendaView tasks={tasks} weddingPrepEvents={weddingPrepEvents} />}
    </div>
  );
}
