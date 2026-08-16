/**
 * Placeholder Supabase database types (section 54).
 *
 * No live Supabase project is available in this environment, so these
 * types cannot be generated from a real schema yet. Once a project exists,
 * replace this file's contents with the real generated types:
 *
 *   npx supabase gen types typescript --project-id <your-project-ref> \
 *     --schema public > src/lib/supabase/database.types.ts
 *
 * Until then, every table is typed generically (loosely) via an index
 * signature rather than `any` — the generic repository adapter
 * (src/data/adapters/) narrows each table's rows to a real domain type at
 * its boundary via the per-entity mappers in src/data/supabase/mappers.ts,
 * so this file's looseness never leaks into application code.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface GenericTable {
  Row: Record<string, Json>;
  Insert: Record<string, Json>;
  Update: Record<string, Json>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      [tableName: string]: GenericTable;
    };
    Views: Record<string, never>;
    Functions: {
      [functionName: string]: {
        Args: Record<string, Json>;
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
