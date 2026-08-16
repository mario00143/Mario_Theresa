import { describe, expect, it } from 'vitest';
import { WORKSPACE_ROLES } from '@/types';
import {
  PERMISSION_MODULES,
  PERMISSION_MATRIX,
  canAssignRole,
  canRead,
  canWrite,
  getModulePermission,
  isAdminOrCouple,
  readOnlyReason,
} from '@/utils/permissions';

describe('PERMISSION_MATRIX (section 9/15)', () => {
  it('defines a permission level for every role x module combination', () => {
    for (const role of WORKSPACE_ROLES) {
      for (const module of PERMISSION_MODULES) {
        expect(PERMISSION_MATRIX[role][module]).toBeDefined();
      }
    }
  });

  it('gives Admin and Couple full write access to every module except auditLog (read-only by nature)', () => {
    for (const role of ['Admin', 'Couple'] as const) {
      for (const module of PERMISSION_MODULES) {
        if (module === 'auditLog') {
          expect(PERMISSION_MATRIX[role][module]).toBe('read');
        } else {
          expect(PERMISSION_MATRIX[role][module]).toBe('write');
        }
      }
    }
  });

  it('gives Viewer no write access to any module', () => {
    for (const module of PERMISSION_MODULES) {
      expect(PERMISSION_MATRIX.Viewer[module]).not.toBe('write');
    }
  });

  it('gives Finance Lead write access to vendors and finance, read-only elsewhere it can see', () => {
    expect(PERMISSION_MATRIX['Finance Lead'].vendors).toBe('write');
    expect(PERMISSION_MATRIX['Finance Lead'].finance).toBe('write');
    expect(PERMISSION_MATRIX['Finance Lead'].guests).toBe('read');
    expect(PERMISSION_MATRIX['Finance Lead'].members).toBe('none');
  });

  it('gives Day-of Operator write access only to weddingDay', () => {
    const dayOf = PERMISSION_MATRIX['Day-of Operator'];
    expect(dayOf.weddingDay).toBe('write');
    for (const module of PERMISSION_MODULES) {
      if (module !== 'weddingDay') expect(dayOf[module]).not.toBe('write');
    }
  });

  it('gives Family Editor write access to guests/logistics/tasks but not finance', () => {
    const familyEditor = PERMISSION_MATRIX['Family Editor'];
    expect(familyEditor.guests).toBe('write');
    expect(familyEditor.logistics).toBe('write');
    expect(familyEditor.tasks).toBe('write');
    expect(familyEditor.finance).toBe('none');
  });

  it('gives Workstream Lead write access to tasks and weddingPrep', () => {
    const lead = PERMISSION_MATRIX['Workstream Lead'];
    expect(lead.tasks).toBe('write');
    expect(lead.weddingPrep).toBe('write');
    expect(lead.finance).toBe('none');
  });
});

describe('getModulePermission / canRead / canWrite', () => {
  it('returns none for an undefined role', () => {
    expect(getModulePermission(undefined, 'tasks')).toBe('none');
    expect(canRead(undefined, 'tasks')).toBe(false);
    expect(canWrite(undefined, 'tasks')).toBe(false);
  });

  it('read is true for both read and write levels', () => {
    expect(canRead('Viewer', 'tasks')).toBe(true);
    expect(canRead('Admin', 'tasks')).toBe(true);
  });

  it('write is true only for the write level', () => {
    expect(canWrite('Viewer', 'tasks')).toBe(false);
    expect(canWrite('Admin', 'tasks')).toBe(true);
  });
});

describe('canAssignRole (section 9 — no escalation unless Admin)', () => {
  it('lets Admin assign any role including Admin', () => {
    for (const role of WORKSPACE_ROLES) {
      expect(canAssignRole('Admin', role)).toBe(true);
    }
  });

  it('lets Couple assign any role except Admin', () => {
    expect(canAssignRole('Couple', 'Admin')).toBe(false);
    for (const role of WORKSPACE_ROLES.filter((r) => r !== 'Admin')) {
      expect(canAssignRole('Couple', role)).toBe(true);
    }
  });

  it('lets no other role assign any role', () => {
    for (const role of ['Finance Lead', 'Workstream Lead', 'Family Editor', 'Viewer', 'Day-of Operator'] as const) {
      for (const target of WORKSPACE_ROLES) {
        expect(canAssignRole(role, target)).toBe(false);
      }
    }
  });

  it('returns false when the actor role is undefined', () => {
    expect(canAssignRole(undefined, 'Viewer')).toBe(false);
  });
});

describe('isAdminOrCouple', () => {
  it('is true only for Admin and Couple', () => {
    expect(isAdminOrCouple('Admin')).toBe(true);
    expect(isAdminOrCouple('Couple')).toBe(true);
    expect(isAdminOrCouple('Viewer')).toBe(false);
    expect(isAdminOrCouple(undefined)).toBe(false);
  });
});

describe('readOnlyReason (section 53)', () => {
  it('returns null when the role can write', () => {
    expect(readOnlyReason('Admin', 'tasks')).toBeNull();
  });

  it('returns a read-only message when the role can read but not write', () => {
    expect(readOnlyReason('Viewer', 'tasks')).toBe('Read-only for your role');
  });

  it('returns an unavailable message when the role has no access at all', () => {
    expect(readOnlyReason('Viewer', 'finance')).toBe('Not available for your role');
  });
});
