import { Route, Routes } from 'react-router-dom';
import { GuestsNav } from '@/features/guests/GuestsNav';
import { GuestOverviewView } from '@/features/guests/GuestOverviewView';
import { HouseholdsView } from '@/features/guests/HouseholdsView';
import { GuestsListView } from '@/features/guests/GuestsListView';
import { InvitationsView } from '@/features/guests/InvitationsView';
import { RsvpView } from '@/features/guests/RsvpView';
import { GuestReportsView } from '@/features/guests/GuestReportsView';

export function GuestsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Guests</h1>
        <p className="text-sm text-ink-faint mt-0.5">Households, guests, invitations, and RSVPs for both events.</p>
      </div>
      <GuestsNav />
      <Routes>
        <Route index element={<GuestOverviewView />} />
        <Route path="households" element={<HouseholdsView />} />
        <Route path="guests" element={<GuestsListView />} />
        <Route path="invitations" element={<InvitationsView />} />
        <Route path="rsvp" element={<RsvpView />} />
        <Route path="reports" element={<GuestReportsView />} />
      </Routes>
    </div>
  );
}
