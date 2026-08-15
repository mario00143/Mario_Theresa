import { useState } from 'react';
import { AlertTriangle, BedDouble, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHotels } from '@/hooks/useHotels';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useTravel } from '@/hooks/useTravel';
import { computeHotelIndicators } from '@/utils/logisticsStats';
import { AddHotelModal } from './AddHotelModal';
import { HotelDetailDrawer } from './HotelDetailDrawer';

export function HotelsView() {
  const { hotels } = useHotels();
  const { roomTypes } = useRoomTypes();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { travelSegments } = useTravel();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const indicators = computeHotelIndicators(hotels, rooms, roomTypes, roomAssignments, travelSegments);
  const indicatorByHotelId = new Map(indicators.map((i) => [i.hotelId, i]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Hotels</h2>
        <Button variant="primary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setAddOpen(true)}>
          Add Hotel
        </Button>
      </div>

      {hotels.length === 0 ? (
        <EmptyState icon={<BedDouble className="size-8" aria-hidden="true" />} title="No hotels yet" description="Add a hotel to start tracking room types, rooms, and accommodation." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => {
            const indicator = indicatorByHotelId.get(hotel.id);
            const hasFlags =
              indicator &&
              (indicator.overAllocatedRoomCount > 0 || indicator.accessibilityConflictCount > 0 || indicator.earlyArrivalCount > 0 || indicator.lateDepartureCount > 0);
            return (
              <Card
                key={hotel.id}
                className={`cursor-pointer hover:border-brand-300 ${hasFlags ? 'border-warning/40' : ''}`}
                onClick={() => setSelectedHotelId(hotel.id)}
              >
                <CardHeader>
                  <CardTitle>{hotel.name}</CardTitle>
                  {hasFlags && <AlertTriangle className="size-4 text-warning shrink-0" aria-hidden="true" />}
                </CardHeader>
                <CardBody className="space-y-2.5">
                  <p className="text-xs text-ink-faint">
                    {hotel.area ? `${hotel.area}, ` : ''}
                    {hotel.city}
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <Badge tone="neutral">{indicator?.roomCount ?? 0} rooms</Badge>
                    <Badge tone="neutral">
                      {indicator?.occupantCount ?? 0}/{indicator?.totalCapacity ?? 0} occupied
                    </Badge>
                    {hotel.breakfastIncluded && <Badge tone="info">Breakfast</Badge>}
                    {hotel.accessibleRoomsAvailable && <Badge tone="info">Accessible rooms</Badge>}
                  </div>
                  {hasFlags && (
                    <div className="space-y-1 pt-1">
                      {indicator!.overAllocatedRoomCount > 0 && (
                        <p className="text-xs text-critical">{indicator!.overAllocatedRoomCount} room(s) over capacity</p>
                      )}
                      {indicator!.accessibilityConflictCount > 0 && (
                        <p className="text-xs text-warning">{indicator!.accessibilityConflictCount} accessibility mismatch(es)</p>
                      )}
                      {indicator!.earlyArrivalCount > 0 && <p className="text-xs text-warning">{indicator!.earlyArrivalCount} early arrival(s)</p>}
                      {indicator!.lateDepartureCount > 0 && <p className="text-xs text-warning">{indicator!.lateDepartureCount} late departure(s)</p>}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <AddHotelModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={(id) => setSelectedHotelId(id)} />
      <HotelDetailDrawer hotelId={selectedHotelId} onClose={() => setSelectedHotelId(null)} />
    </div>
  );
}
