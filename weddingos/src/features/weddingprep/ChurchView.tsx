import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ChurchRequirement, ChurchRequirementCategory, ChurchRequirementStatus } from '@/types';
import { CHURCH_APPLICABILITY, CHURCH_REQUIREMENT_CATEGORIES, CHURCH_REQUIREMENT_STATUSES, DENOMINATIONS } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { computeChurchRequirementWarnings, getParishConfirmationQueue } from '@/utils/churchLogic';

const STATUS_TONE: Record<ChurchRequirementStatus, 'success' | 'warning' | 'critical' | 'neutral'> = {
  'Not Started': 'neutral',
  'In Progress': 'neutral',
  Waiting: 'warning',
  Submitted: 'warning',
  Verified: 'success',
  Complete: 'success',
  Blocked: 'critical',
  'Not Applicable': 'neutral',
};

function RequirementCard({ requirement }: { requirement: ChurchRequirement }) {
  const { updateChurchRequirement, deleteChurchRequirement, verifyChurchRequirement } = useChurchRequirements();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const warnings = computeChurchRequirementWarnings(requirement);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{requirement.title}</span>
          <Badge tone={STATUS_TONE[requirement.status]}>{requirement.status}</Badge>
          {requirement.applicability !== 'Applicable' && <Badge tone="neutral">{requirement.applicability}</Badge>}
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete requirement "${requirement.title}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {warnings.length > 0 && (
        <ul className="list-disc list-inside space-y-0.5">
          {warnings.map((w) => (
            <li key={w} className="text-xs text-warning">
              {w}
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`cr-title-${requirement.id}`}>Title</Label>
          <Input id={`cr-title-${requirement.id}`} defaultValue={requirement.title} key={`cr-title-${requirement.id}`} onBlur={(e) => updateChurchRequirement(requirement.id, { title: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`cr-category-${requirement.id}`}>Category</Label>
          <Select
            id={`cr-category-${requirement.id}`}
            value={requirement.category}
            onChange={(e) => updateChurchRequirement(requirement.id, { category: e.target.value as ChurchRequirementCategory })}
          >
            {CHURCH_REQUIREMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`cr-applicability-${requirement.id}`}>Applicability</Label>
          <Select
            id={`cr-applicability-${requirement.id}`}
            value={requirement.applicability}
            onChange={(e) => updateChurchRequirement(requirement.id, { applicability: e.target.value as ChurchRequirement['applicability'] })}
          >
            {CHURCH_APPLICABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`cr-status-${requirement.id}`}>Status</Label>
          <Select id={`cr-status-${requirement.id}`} value={requirement.status} onChange={(e) => updateChurchRequirement(requirement.id, { status: e.target.value as ChurchRequirementStatus })}>
            {CHURCH_REQUIREMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`cr-owner-${requirement.id}`}>Owner</Label>
          <Input id={`cr-owner-${requirement.id}`} defaultValue={requirement.owner ?? ''} key={`cr-owner-${requirement.id}`} onBlur={(e) => updateChurchRequirement(requirement.id, { owner: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`cr-due-${requirement.id}`}>Due date</Label>
          <Input
            id={`cr-due-${requirement.id}`}
            type="date"
            defaultValue={requirement.dueDate ?? ''}
            key={`cr-due-${requirement.id}`}
            onBlur={(e) => updateChurchRequirement(requirement.id, { dueDate: e.target.value || undefined })}
          />
        </Field>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={requirement.documentRequired}
            onChange={(e) => updateChurchRequirement(requirement.id, { documentRequired: e.target.checked })}
            className="size-4 accent-brand-700"
          />
          Document required
        </label>
        {requirement.documentRequired && (
          <Input
            defaultValue={requirement.documentName ?? ''}
            key={`cr-doc-${requirement.id}`}
            onBlur={(e) => updateChurchRequirement(requirement.id, { documentName: e.target.value || undefined })}
            placeholder="Document name / reference"
            aria-label="Document name"
            className="max-w-[16rem]"
          />
        )}
        {requirement.status === 'Submitted' && (
          <Button variant="secondary" size="sm" onClick={() => verifyChurchRequirement(requirement.id, requirement.owner ?? 'Unknown')}>
            Mark verified
          </Button>
        )}
      </div>

      <Field>
        <Label htmlFor={`cr-notes-${requirement.id}`}>Notes</Label>
        <Textarea id={`cr-notes-${requirement.id}`} defaultValue={requirement.notes ?? ''} key={`cr-notes-${requirement.id}`} onBlur={(e) => updateChurchRequirement(requirement.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete requirement"
        message={`Delete "${requirement.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteChurchRequirement(requirement.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function ChurchView() {
  const { churchProfiles, addChurchProfile, updateChurchProfile } = useChurchProfiles();
  const { churchRequirements, addChurchRequirement } = useChurchRequirements();
  const [newTitle, setNewTitle] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ChurchRequirementCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ChurchRequirementStatus>('All');

  const church = churchProfiles[0];
  const parishQueue = getParishConfirmationQueue(churchRequirements);

  const filtered = churchRequirements.filter(
    (r) => (categoryFilter === 'All' || r.category === categoryFilter) && (statusFilter === 'All' || r.status === statusFilter),
  );

  const handleAddRequirement = () => {
    if (!newTitle.trim() || !church) return;
    addChurchRequirement({
      churchProfileId: church.id,
      title: newTitle.trim(),
      category: 'Other',
      applicability: 'Applicable',
      status: 'Not Started',
      documentRequired: false,
    });
    setNewTitle('');
  };

  const handleCreateProfile = () => {
    addChurchProfile({ event: 'Wedding', churchName: 'New Church', denomination: 'To Be Confirmed' });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Church profile</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {!church ? (
            <EmptyState title="No church profile yet" description="Create the primary wedding church profile to get started." action={<Button onClick={handleCreateProfile}>Add church profile</Button>} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <Field>
                  <Label htmlFor="ch-name" required>
                    Church name
                  </Label>
                  <Input id="ch-name" defaultValue={church.churchName} key={`ch-name-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { churchName: e.target.value })} />
                </Field>
                <Field>
                  <Label htmlFor="ch-denomination">Denomination</Label>
                  <Select id="ch-denomination" value={church.denomination} onChange={(e) => updateChurchProfile(church.id, { denomination: e.target.value as (typeof DENOMINATIONS)[number] })}>
                    {DENOMINATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field>
                  <Label htmlFor="ch-parish">Parish name</Label>
                  <Input id="ch-parish" defaultValue={church.parishName ?? ''} key={`ch-parish-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { parishName: e.target.value || undefined })} />
                </Field>
                <Field>
                  <Label htmlFor="ch-city">City</Label>
                  <Input id="ch-city" defaultValue={church.city ?? ''} key={`ch-city-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { city: e.target.value || undefined })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Field>
                  <Label htmlFor="ch-clergy">Primary clergy</Label>
                  <Input id="ch-clergy" defaultValue={church.primaryClergyName ?? ''} key={`ch-clergy-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { primaryClergyName: e.target.value || undefined })} />
                </Field>
                <Field>
                  <Label htmlFor="ch-clergy-phone">Clergy phone</Label>
                  <Input id="ch-clergy-phone" defaultValue={church.primaryClergyPhone ?? ''} key={`ch-clergy-phone-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { primaryClergyPhone: e.target.value || undefined })} />
                </Field>
                <Field>
                  <Label htmlFor="ch-ceremony-time">Ceremony start time</Label>
                  <Input id="ch-ceremony-time" type="time" defaultValue={church.ceremonyStartTime ?? ''} key={`ch-ceremony-time-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { ceremonyStartTime: e.target.value || undefined })} />
                </Field>
                <Field>
                  <Label htmlFor="ch-access-time">Access start time</Label>
                  <Input id="ch-access-time" type="time" defaultValue={church.accessStartTime ?? ''} key={`ch-access-time-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { accessStartTime: e.target.value || undefined })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field>
                  <Label htmlFor="ch-rehearsal-date">Rehearsal date</Label>
                  <Input id="ch-rehearsal-date" type="date" defaultValue={church.rehearsalDate ?? ''} key={`ch-rehearsal-date-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { rehearsalDate: e.target.value || undefined })} />
                </Field>
                <Field>
                  <Label htmlFor="ch-rehearsal-time">Rehearsal time</Label>
                  <Input id="ch-rehearsal-time" type="time" defaultValue={church.rehearsalTime ?? ''} key={`ch-rehearsal-time-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { rehearsalTime: e.target.value || undefined })} />
                </Field>
              </div>
              <Field>
                <Label htmlFor="ch-decor-restrictions">Décor restrictions</Label>
                <Textarea id="ch-decor-restrictions" defaultValue={church.decorRestrictions ?? ''} key={`ch-decor-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { decorRestrictions: e.target.value || undefined })} />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field>
                  <Label htmlFor="ch-photo-restrictions">Photography restrictions</Label>
                  <Textarea id="ch-photo-restrictions" defaultValue={church.photographyRestrictions ?? ''} key={`ch-photo-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { photographyRestrictions: e.target.value || undefined })} />
                </Field>
                <Field>
                  <Label htmlFor="ch-music-restrictions">Music restrictions</Label>
                  <Textarea id="ch-music-restrictions" defaultValue={church.musicRestrictions ?? ''} key={`ch-music-${church.id}`} onBlur={(e) => updateChurchProfile(church.id, { musicRestrictions: e.target.value || undefined })} />
                </Field>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {parishQueue.length > 0 && (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle>Confirm with Parish queue</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-line-soft">
              {parishQueue.map((r) => (
                <div key={r.id} className="px-4 py-2.5">
                  <p className="text-sm font-medium text-ink">{r.title}</p>
                  {r.notes && <p className="text-xs text-ink-faint mt-0.5">{r.notes}</p>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Requirements ({filtered.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="max-w-[12rem]" aria-label="Filter by category">
              <option value="All">All categories</option>
              {CHURCH_REQUIREMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="max-w-[10rem]" aria-label="Filter by status">
              <option value="All">All statuses</option>
              {CHURCH_REQUIREMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No requirements match" description="Try a different filter, or add a new requirement below." />
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <RequirementCard key={r.id} requirement={r} />
              ))}
            </div>
          )}

          {church && (
            <div className="flex gap-2 pt-2">
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New requirement title…" aria-label="New requirement title" />
              <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddRequirement} disabled={!newTitle.trim()}>
                Add Requirement
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
