import { v4 as uuid } from 'uuid';

export function generateId(prefix?: string): string {
  return prefix ? `${prefix}_${uuid()}` : uuid();
}
