export const VEHICLE_TYPES = [
  'Sedan',
  'SUV',
  'Innova / MUV',
  'Tempo Traveller',
  'Mini Bus',
  'Bus',
  'Luxury Car',
  'Other',
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_STATUSES = ['Available', 'Assigned', 'In Service', 'Out of Service'] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export interface Vehicle {
  id: string;
  name: string;
  vehicleType: VehicleType;
  registrationNumber?: string;
  passengerCapacity: number;
  luggageCapacity?: number;
  airConditioned: boolean;
  vendorName?: string;
  status: VehicleStatus;
  /** True if this vehicle is kept in reserve rather than on the primary schedule. */
  backupVehicle: boolean;
  /** Deliberate, optional link to a commercial Vendor record — never set automatically. */
  vendorId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
