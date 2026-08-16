import { describe, expect, it } from 'vitest';
import { genericFromRow, genericToRow } from '@/data/adapters/genericMapper';

interface SampleEntity {
  id: string;
  fullName: string;
  isVip: boolean;
  dueDate?: string;
  microphoneCount: number;
  avVendorId?: string;
}

describe('genericToRow (section 22)', () => {
  it('converts camelCase keys to snake_case and injects workspace_id', () => {
    const record: SampleEntity = { id: 'g1', fullName: 'Jane Doe', isVip: true, microphoneCount: 2 };
    const row = genericToRow(record as unknown as Record<string, unknown>, 'ws-1', 'user-1');
    expect(row).toMatchObject({
      id: 'g1',
      full_name: 'Jane Doe',
      is_vip: true,
      microphone_count: 2,
      workspace_id: 'ws-1',
      updated_by: 'user-1',
    });
  });

  it('handles a field name with a consecutive-capital acronym run correctly (av -> a_v not needed)', () => {
    const row = genericToRow({ avVendorId: 'v1' } as Record<string, unknown>, 'ws-1', null);
    expect(row.av_vendor_id).toBe('v1');
    expect(row).not.toHaveProperty('a_v_vendor_id');
  });

  it('converts undefined values to null rather than omitting the key', () => {
    const row = genericToRow({ dueDate: undefined } as Record<string, unknown>, 'ws-1', null);
    expect(row.due_date).toBeNull();
  });

  it('omits updated_by when userId is null', () => {
    const row = genericToRow({ id: 'g1' } as Record<string, unknown>, 'ws-1', null);
    expect(row).not.toHaveProperty('updated_by');
  });
});

describe('genericFromRow', () => {
  it('converts snake_case columns back to camelCase and drops workspace/audit columns', () => {
    const row = {
      id: 'g1',
      full_name: 'Jane Doe',
      is_vip: true,
      microphone_count: 2,
      workspace_id: 'ws-1',
      created_by: 'u1',
      updated_by: 'u2',
    };
    const record = genericFromRow<SampleEntity>(row);
    expect(record).toEqual({ id: 'g1', fullName: 'Jane Doe', isVip: true, microphoneCount: 2 });
  });

  it('converts null values back to undefined', () => {
    const record = genericFromRow<SampleEntity>({ id: 'g1', due_date: null });
    expect(record.dueDate).toBeUndefined();
  });
});

describe('genericToRow / genericFromRow round trip', () => {
  it('preserves a record through a full to-row-and-back cycle (minus workspace scoping)', () => {
    const original: SampleEntity = { id: 'g1', fullName: 'Jane Doe', isVip: false, microphoneCount: 4, avVendorId: 'v9' };
    const row = genericToRow(original as unknown as Record<string, unknown>, 'ws-1', 'user-1');
    const roundTripped = genericFromRow<SampleEntity>(row);
    expect(roundTripped).toEqual(original);
  });
});
