import { Route, Routes } from 'react-router-dom';
import { LogisticsNav } from '@/features/logistics/LogisticsNav';
import { LogisticsOverviewView } from '@/features/logistics/LogisticsOverviewView';
import { TravelView } from '@/features/logistics/TravelView';
import { HotelsView } from '@/features/logistics/HotelsView';
import { RoomsView } from '@/features/logistics/RoomsView';
import { TransportView } from '@/features/logistics/TransportView';
import { AssignmentsView } from '@/features/logistics/AssignmentsView';
import { LogisticsReportsView } from '@/features/logistics/LogisticsReportsView';

export function LogisticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Logistics</h1>
        <p className="text-sm text-ink-faint mt-0.5">Travel, accommodation, and transport for the Engagement (Goa) and Wedding (Hyderabad).</p>
      </div>
      <LogisticsNav />
      <Routes>
        <Route index element={<LogisticsOverviewView />} />
        <Route path="travel" element={<TravelView />} />
        <Route path="hotels" element={<HotelsView />} />
        <Route path="rooms" element={<RoomsView />} />
        <Route path="transport" element={<TransportView />} />
        <Route path="assignments" element={<AssignmentsView />} />
        <Route path="reports" element={<LogisticsReportsView />} />
      </Routes>
    </div>
  );
}
