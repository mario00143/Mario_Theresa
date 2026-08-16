import { useMemo, useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import type { LiveIssue, LiveIssueCategory, LiveIssueSeverity } from '@/types';
import { LIVE_ISSUE_CATEGORIES, LIVE_ISSUE_SEVERITIES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSettings } from '@/hooks/useSettings';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useVendors } from '@/hooks/useVendors';
import { useGuests } from '@/hooks/useGuests';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { isLiveIssueEscalationDue, isLiveIssueOpen, liveIssueOpenMinutes } from '@/utils/liveIssueLogic';
import { liveIssuesCsvFilename, liveIssuesToCSV } from '@/data/repositories/weddingDayCsv';
import { downloadTextFile } from '@/utils/download';

const SEVERITY_TONE: Record<LiveIssueSeverity, BadgeTone> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
};

type ViewFilter = 'Open' | 'Critical' | 'High' | 'All' | 'Resolved';

function IssueCard({ issueId }: { issueId: string }) {
  const { settings } = useSettings();
  const { liveIssues, updateLiveIssue, deleteLiveIssue, escalateLiveIssue, assignLiveIssueOwner, addLiveIssueMitigation, resolveLiveIssue, reopenLiveIssue } = useLiveIssues();
  const { runSheetItems } = useRunSheet();
  const { vendors } = useVendors();
  const { guests } = useGuests();
  const { routes } = useTransportRoutes();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mitigationDraft, setMitigationDraft] = useState('');
  const [resolutionDraft, setResolutionDraft] = useState('');
  const [ownerDraft, setOwnerDraft] = useState('');
  const [backupOwnerDraft, setBackupOwnerDraft] = useState('');

  const issue = liveIssues.find((i) => i.id === issueId);
  if (!issue) return null;

  const open = isLiveIssueOpen(issue);
  const openMinutes = liveIssueOpenMinutes(issue, settings.weddingDay.simulationDateTimeISO);
  const escalationDue = isLiveIssueEscalationDue(issue, settings.weddingDay, settings.weddingDay.simulationDateTimeISO);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{issue.title}</span>
          <Badge tone={SEVERITY_TONE[issue.severity]}>{issue.severity}</Badge>
          <Badge tone="neutral">{issue.category}</Badge>
          <Badge tone={open ? 'warning' : 'success'}>{issue.status}</Badge>
          {open && <Badge tone={escalationDue ? 'critical' : 'neutral'}>Open for {openMinutes} min{escalationDue ? ' — escalation due' : ''}</Badge>}
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete issue "${issue.title}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {issue.description && <p className="text-sm text-ink-faint">{issue.description}</p>}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`li-category-${issue.id}`}>Category</Label>
          <Select id={`li-category-${issue.id}`} value={issue.category} onChange={(e) => updateLiveIssue(issue.id, { category: e.target.value as LiveIssueCategory })}>
            {LIVE_ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`li-location-${issue.id}`}>Location</Label>
          <Input id={`li-location-${issue.id}`} defaultValue={issue.location ?? ''} key={`li-location-${issue.id}`} onBlur={(e) => updateLiveIssue(issue.id, { location: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`li-owner-${issue.id}`}>Owner</Label>
          <Input id={`li-owner-${issue.id}`} defaultValue={issue.owner ?? ''} key={`li-owner-${issue.id}`} onChange={(e) => setOwnerDraft(e.target.value)} onBlur={() => assignLiveIssueOwner(issue.id, ownerDraft || issue.owner || '', issue.backupOwner)} />
        </Field>
        <Field>
          <Label htmlFor={`li-backup-owner-${issue.id}`}>Backup owner</Label>
          <Input
            id={`li-backup-owner-${issue.id}`}
            defaultValue={issue.backupOwner ?? ''}
            key={`li-backup-owner-${issue.id}`}
            onChange={(e) => setBackupOwnerDraft(e.target.value)}
            onBlur={() => assignLiveIssueOwner(issue.id, issue.owner ?? ownerDraft ?? '', backupOwnerDraft || issue.backupOwner)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <Field>
          <Label htmlFor={`li-runsheet-${issue.id}`}>Linked run-sheet item</Label>
          <Select id={`li-runsheet-${issue.id}`} value={issue.relatedRunSheetItemId ?? ''} onChange={(e) => updateLiveIssue(issue.id, { relatedRunSheetItemId: e.target.value || undefined })}>
            <option value="">None</option>
            {runSheetItems.map((r) => (
              <option key={r.id} value={r.id}>
                {r.activity}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`li-vendor-${issue.id}`}>Linked vendor</Label>
          <Select id={`li-vendor-${issue.id}`} value={issue.relatedVendorId ?? ''} onChange={(e) => updateLiveIssue(issue.id, { relatedVendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`li-guest-${issue.id}`}>Linked guest</Label>
          <Select id={`li-guest-${issue.id}`} value={issue.relatedGuestId ?? ''} onChange={(e) => updateLiveIssue(issue.id, { relatedGuestId: e.target.value || undefined })}>
            <option value="">None</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.fullName}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`li-route-${issue.id}`}>Linked transport route</Label>
          <Select id={`li-route-${issue.id}`} value={issue.relatedTransportRouteId ?? ''} onChange={(e) => updateLiveIssue(issue.id, { relatedTransportRouteId: e.target.value || undefined })}>
            <option value="">None</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {issue.mitigation && (
        <p className="text-sm">
          <span className="text-ink-faint">Mitigation: </span>
          {issue.mitigation}
        </p>
      )}
      {issue.resolution && (
        <p className="text-sm">
          <span className="text-ink-faint">Resolution: </span>
          {issue.resolution}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {issue.severity !== 'Critical' && (
          <Select
            value=""
            onChange={(e) => e.target.value && escalateLiveIssue(issue.id, e.target.value as LiveIssueSeverity)}
            className="max-w-[10rem]"
            aria-label="Escalate severity"
          >
            <option value="">Escalate to…</option>
            {LIVE_ISSUE_SEVERITIES.filter((s) => s !== issue.severity).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        )}
        {open && (
          <>
            <Input
              placeholder="Add mitigation note…"
              value={mitigationDraft}
              onChange={(e) => setMitigationDraft(e.target.value)}
              className="max-w-[16rem]"
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={!mitigationDraft.trim()}
              onClick={() => {
                addLiveIssueMitigation(issue.id, mitigationDraft.trim());
                setMitigationDraft('');
              }}
            >
              Add mitigation
            </Button>
          </>
        )}
        {open && (
          <>
            <Input placeholder="Resolution notes…" value={resolutionDraft} onChange={(e) => setResolutionDraft(e.target.value)} className="max-w-[16rem]" />
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                resolveLiveIssue(issue.id, resolutionDraft.trim() || undefined);
                setResolutionDraft('');
              }}
            >
              Mark resolved
            </Button>
          </>
        )}
        {!open && (
          <Button variant="secondary" size="sm" onClick={() => reopenLiveIssue(issue.id)}>
            Reopen
          </Button>
        )}
      </div>

      <Field>
        <Label htmlFor={`li-notes-${issue.id}`}>Notes</Label>
        <Textarea id={`li-notes-${issue.id}`} defaultValue={issue.notes ?? ''} key={`li-notes-${issue.id}`} onBlur={(e) => updateLiveIssue(issue.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete issue"
        message={`Delete "${issue.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteLiveIssue(issue.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function IssuesView() {
  const { liveIssues, addLiveIssue } = useLiveIssues();
  const [view, setView] = useState<ViewFilter>('Open');
  const [newTitle, setNewTitle] = useState('');

  const filtered = useMemo(() => {
    switch (view) {
      case 'Open':
        return liveIssues.filter(isLiveIssueOpen);
      case 'Critical':
        return liveIssues.filter((i) => isLiveIssueOpen(i) && i.severity === 'Critical');
      case 'High':
        return liveIssues.filter((i) => isLiveIssueOpen(i) && i.severity === 'High');
      case 'Resolved':
        return liveIssues.filter((i) => !isLiveIssueOpen(i));
      default:
        return liveIssues;
    }
  }, [liveIssues, view]);

  function handleAdd() {
    if (!newTitle.trim()) return;
    addLiveIssue({
      title: newTitle.trim(),
      category: 'Other',
      severity: 'Medium',
      status: 'Open',
      reportedAt: new Date().toISOString(),
      followUpRequired: false,
    });
    setNewTitle('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live issues ({filtered.length})</CardTitle>
        <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(liveIssuesCsvFilename(), liveIssuesToCSV(liveIssues), 'text/csv')}>
          Export CSV
        </Button>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {(['Open', 'Critical', 'High', 'All', 'Resolved'] as ViewFilter[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                view === v ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-line text-ink-soft hover:bg-surface-subtle'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No issues in this view" description="Try a different filter, or add a new issue below." />
        ) : (
          <div className="space-y-3">
            {filtered.map((i: LiveIssue) => (
              <IssueCard key={i.id} issueId={i.id} />
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New issue title…" aria-label="New issue title" />
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newTitle.trim()}>
            Add issue
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
