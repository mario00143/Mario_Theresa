import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { APP_VERSION, BUILD_TIMESTAMP, GIT_SHA, OFFLINE_SNAPSHOT_SCHEMA_VERSION } from '@/lib/appVersion';
import { BACKUP_VERSION } from '@/types/backup';

/** Section 27's simple About panel — visible to everyone, not just Admins (unlike the fuller System Diagnostics view). */
export function AboutSection() {
  const { supabaseEnabled } = useAuth();
  return (
    <Card>
      <CardHeader>
        <CardTitle>About WeddingOS</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-ink-faint">Version</p>
          <p className="font-medium text-ink">{APP_VERSION}</p>
        </div>
        <div>
          <p className="text-ink-faint">Build</p>
          <p className="font-medium text-ink">{new Date(BUILD_TIMESTAMP).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-ink-faint">Commit</p>
          <p className="font-medium text-ink">{GIT_SHA}</p>
        </div>
        <div>
          <p className="text-ink-faint">Mode</p>
          <p className="font-medium text-ink">{supabaseEnabled ? 'Production (Supabase)' : 'Demo / Local'}</p>
        </div>
        <div>
          <p className="text-ink-faint">Backup schema version</p>
          <p className="font-medium text-ink">v{BACKUP_VERSION}</p>
        </div>
        <div>
          <p className="text-ink-faint">Offline Pack schema version</p>
          <p className="font-medium text-ink">v{OFFLINE_SNAPSHOT_SCHEMA_VERSION}</p>
        </div>
      </CardBody>
    </Card>
  );
}
