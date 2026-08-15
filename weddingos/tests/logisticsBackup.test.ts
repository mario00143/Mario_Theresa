import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, importBackup, normalizeBackup, validateBackup } from '@/data/repositories/backupRepository';
import {
  driversStore,
  hotelsStore,
  resetToDemoData,
  roomAssignmentsStore,
  roomsStore,
  transportAssignmentsStore,
  transportRoutesStore,
  travelSegmentsStore,
  vehiclesStore,
} from '@/data/stores';
import { BACKUP_VERSION } from '@/types';

describe('version 3 backup export', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('exports version 3 with all logistics collections included', () => {
    const backup = exportBackup();
    expect(backup.version).toBe(3);
    expect(BACKUP_VERSION).toBe(3);
    expect(backup.travelSegments.length).toBeGreaterThan(0);
    expect(backup.hotels.length).toBeGreaterThan(0);
    expect(backup.roomTypes.length).toBeGreaterThan(0);
    expect(backup.rooms.length).toBeGreaterThan(0);
    expect(backup.roomAssignments.length).toBeGreaterThan(0);
    expect(backup.vehicles.length).toBeGreaterThan(0);
    expect(backup.drivers.length).toBeGreaterThan(0);
    expect(backup.transportRoutes.length).toBeGreaterThan(0);
    expect(backup.transportAssignments.length).toBeGreaterThan(0);
  });
});

describe('version 3 backup round trip', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('validates and imports a well-formed version 3 backup', () => {
    const backup = exportBackup();
    const result = validateBackup(backup);
    expect(result.valid).toBe(true);

    const trimmed = {
      ...backup,
      travelSegments: backup.travelSegments.slice(0, 5),
      hotels: backup.hotels.slice(0, 1),
      vehicles: backup.vehicles.slice(0, 2),
      drivers: backup.drivers.slice(0, 2),
    };
    importBackup(trimmed);
    expect(travelSegmentsStore.get()).toHaveLength(5);
    expect(hotelsStore.get()).toHaveLength(1);
    expect(vehiclesStore.get()).toHaveLength(2);
    expect(driversStore.get()).toHaveLength(2);
  });
});

describe('version 2 backward compatibility', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('accepts a version 2 backup that has no logistics fields at all', () => {
    const backup = exportBackup();
    const {
      travelSegments: _ts, hotels: _h, roomTypes: _rt, rooms: _r, roomAssignments: _ra,
      vehicles: _v, drivers: _d, transportRoutes: _tr, transportAssignments: _ta,
      ...v2Shape
    } = backup;
    const v2Backup = { ...v2Shape, version: 2 };

    const result = validateBackup(v2Backup);
    expect(result.valid).toBe(true);
  });

  it('normalizes a version 2 backup to include empty logistics arrays', () => {
    const backup = exportBackup();
    const {
      travelSegments: _ts, hotels: _h, roomTypes: _rt, rooms: _r, roomAssignments: _ra,
      vehicles: _v, drivers: _d, transportRoutes: _tr, transportAssignments: _ta,
      ...v2Shape
    } = backup;
    const v2Backup = { ...v2Shape, version: 2 };

    const normalized = normalizeBackup(v2Backup);
    expect(normalized.travelSegments).toEqual([]);
    expect(normalized.hotels).toEqual([]);
    expect(normalized.roomTypes).toEqual([]);
    expect(normalized.rooms).toEqual([]);
    expect(normalized.roomAssignments).toEqual([]);
    expect(normalized.vehicles).toEqual([]);
    expect(normalized.drivers).toEqual([]);
    expect(normalized.transportRoutes).toEqual([]);
    expect(normalized.transportAssignments).toEqual([]);
    expect(normalized.households.length).toBeGreaterThan(0);
    expect(normalized.guests.length).toBeGreaterThan(0);
  });

  it('importing a normalized version 2 backup does not fail and clears logistics data', () => {
    const backup = exportBackup();
    const {
      travelSegments: _ts, hotels: _h, roomTypes: _rt, rooms: _r, roomAssignments: _ra,
      vehicles: _v, drivers: _d, transportRoutes: _tr, transportAssignments: _ta,
      ...v2Shape
    } = backup;
    const v2Backup = { ...v2Shape, version: 2 };

    const normalized = normalizeBackup(v2Backup);
    importBackup(normalized);

    expect(travelSegmentsStore.get()).toEqual([]);
    expect(hotelsStore.get()).toEqual([]);
    expect(roomsStore.get()).toEqual([]);
    expect(roomAssignmentsStore.get()).toEqual([]);
    expect(vehiclesStore.get()).toEqual([]);
    expect(transportRoutesStore.get()).toEqual([]);
    expect(transportAssignmentsStore.get()).toEqual([]);
  });
});

describe('version 1 backward compatibility', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('accepts a version 1 backup that has neither guest fields nor logistics fields', () => {
    const backup = exportBackup();
    const {
      households: _hh, guests: _g,
      travelSegments: _ts, hotels: _h, roomTypes: _rt, rooms: _r, roomAssignments: _ra,
      vehicles: _v, drivers: _d, transportRoutes: _tr, transportAssignments: _ta,
      ...v1Shape
    } = backup;
    const v1Backup = { ...v1Shape, version: 1 };

    const result = validateBackup(v1Backup);
    expect(result.valid).toBe(true);
  });

  it('normalizes a version 1 backup to include empty households/guests and empty logistics arrays', () => {
    const backup = exportBackup();
    const {
      households: _hh, guests: _g,
      travelSegments: _ts, hotels: _h, roomTypes: _rt, rooms: _r, roomAssignments: _ra,
      vehicles: _v, drivers: _d, transportRoutes: _tr, transportAssignments: _ta,
      ...v1Shape
    } = backup;
    const v1Backup = { ...v1Shape, version: 1 };

    const normalized = normalizeBackup(v1Backup);
    expect(normalized.households).toEqual([]);
    expect(normalized.guests).toEqual([]);
    expect(normalized.travelSegments).toEqual([]);
    expect(normalized.hotels).toEqual([]);
    expect(normalized.roomAssignments).toEqual([]);
    expect(normalized.vehicles).toEqual([]);
    expect(normalized.transportAssignments).toEqual([]);
    expect(normalized.tasks.length).toBeGreaterThan(0);
  });

  it('importing a normalized version 1 backup does not fail and clears guest and logistics data', () => {
    const backup = exportBackup();
    const {
      households: _hh, guests: _g,
      travelSegments: _ts, hotels: _h, roomTypes: _rt, rooms: _r, roomAssignments: _ra,
      vehicles: _v, drivers: _d, transportRoutes: _tr, transportAssignments: _ta,
      ...v1Shape
    } = backup;
    const v1Backup = { ...v1Shape, version: 1 };

    const normalized = normalizeBackup(v1Backup);
    importBackup(normalized);

    expect(travelSegmentsStore.get()).toEqual([]);
    expect(hotelsStore.get()).toEqual([]);
    expect(vehiclesStore.get()).toEqual([]);
  });
});

describe('invalid logistics backup rejection', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('rejects a version 3 backup with a malformed travel segment (invalid travel mode)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      travelSegments: [{ ...backup.travelSegments[0], travelMode: 'Teleporter' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('travel'))).toBe(true);
  });

  it('rejects a version 3 backup with a malformed room (invalid status)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      rooms: [{ ...backup.rooms[0], status: 'Haunted' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('room'))).toBe(true);
  });

  it('rejects a version 3 backup with a malformed vehicle (invalid vehicle type)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      vehicles: [{ ...backup.vehicles[0], vehicleType: 'Spaceship' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('vehicle'))).toBe(true);
  });

  it('rejects a version 3 backup missing the transportRoutes array entirely', () => {
    const backup = exportBackup();
    const { transportRoutes: _tr, ...rest } = backup;
    const result = validateBackup(rest);
    expect(result.valid).toBe(false);
  });

  it('still rejects completely malformed input', () => {
    expect(validateBackup(null).valid).toBe(false);
    expect(validateBackup({ foo: 'bar' }).valid).toBe(false);
    expect(validateBackup('nonsense').valid).toBe(false);
  });
});
