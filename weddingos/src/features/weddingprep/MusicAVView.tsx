import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { MusicCueType } from '@/types';
import { MUSIC_CUE_TYPES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMusicAVPlans } from '@/hooks/useMusicAVPlans';
import { useMusicCues } from '@/hooks/useMusicCues';
import { useVendors } from '@/hooks/useVendors';
import { useSettings } from '@/hooks/useSettings';
import { computeMusicAVPlanWarnings } from '@/utils/musicLogic';
import { weddingDateTimeISO } from '@/utils/date';

function numberOrUndefined(value: string): number | undefined {
  if (value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function CueRow({ cueId }: { cueId: string }) {
  const { musicCues, updateMusicCue, deleteMusicCue } = useMusicCues();
  const { vendors } = useVendors();
  const cue = musicCues.find((c) => c.id === cueId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!cue) return null;

  return (
    <div className="rounded-lg border border-line-soft p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">
            {cue.sequenceOrder}. {cue.title}
          </span>
          <Badge tone="neutral">{cue.cueType}</Badge>
          <Badge tone={cue.approved ? 'success' : 'warning'}>{cue.approved ? 'Approved' : 'Not approved'}</Badge>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete cue "${cue.title}"`} className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`mc-title-${cue.id}`}>Title</Label>
          <Input id={`mc-title-${cue.id}`} defaultValue={cue.title} key={`mc-title-${cue.id}`} onBlur={(e) => updateMusicCue(cue.id, { title: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`mc-type-${cue.id}`}>Cue type</Label>
          <Select id={`mc-type-${cue.id}`} value={cue.cueType} onChange={(e) => updateMusicCue(cue.id, { cueType: e.target.value as MusicCueType })}>
            {MUSIC_CUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`mc-vendor-${cue.id}`}>Vendor</Label>
          <Select id={`mc-vendor-${cue.id}`} value={cue.linkedVendorId ?? ''} onChange={(e) => updateMusicCue(cue.id, { linkedVendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`mc-time-${cue.id}`}>Planned time</Label>
          <Input id={`mc-time-${cue.id}`} type="time" defaultValue={cue.plannedTime ?? ''} key={`mc-time-${cue.id}`} onBlur={(e) => updateMusicCue(cue.id, { plannedTime: e.target.value || undefined })} />
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={cue.approved} onChange={(e) => updateMusicCue(cue.id, { approved: e.target.checked })} className="size-4 accent-brand-700" />
          Approved
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={cue.backupAvailable} onChange={(e) => updateMusicCue(cue.id, { backupAvailable: e.target.checked })} className="size-4 accent-brand-700" />
          Backup available
        </label>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete music cue"
        message={`Delete "${cue.title}"? It will also be un-linked from any ceremony sequence step. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteMusicCue(cue.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function PlanCard({ planId }: { planId: string }) {
  const { musicAVPlans, updateMusicAVPlan, deleteMusicAVPlan } = useMusicAVPlans();
  const { musicCues } = useMusicCues();
  const { vendors } = useVendors();
  const { settings } = useSettings();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const plan = musicAVPlans.find((p) => p.id === planId);
  if (!plan) return null;
  const weddingDateTime = weddingDateTimeISO(settings);
  const warnings = computeMusicAVPlanWarnings(plan, musicCues, weddingDateTime);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span className="text-sm font-medium text-ink">{plan.event} music &amp; AV plan</span>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete music/AV plan" className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
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

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <Field>
          <Label htmlFor={`mv-choir-${plan.id}`}>Choir vendor</Label>
          <Select id={`mv-choir-${plan.id}`} value={plan.choirVendorId ?? ''} onChange={(e) => updateMusicAVPlan(plan.id, { choirVendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`mv-dj-${plan.id}`}>DJ vendor</Label>
          <Select id={`mv-dj-${plan.id}`} value={plan.djVendorId ?? ''} onChange={(e) => updateMusicAVPlan(plan.id, { djVendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`mv-av-${plan.id}`}>AV vendor</Label>
          <Select id={`mv-av-${plan.id}`} value={plan.avVendorId ?? ''} onChange={(e) => updateMusicAVPlan(plan.id, { avVendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`mv-emcee-${plan.id}`}>Emcee name</Label>
          <Input id={`mv-emcee-${plan.id}`} defaultValue={plan.emceeName ?? ''} key={`mv-emcee-${plan.id}`} onBlur={(e) => updateMusicAVPlan(plan.id, { emceeName: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`mv-emceephone-${plan.id}`}>Emcee phone</Label>
          <Input id={`mv-emceephone-${plan.id}`} defaultValue={plan.emceePhone ?? ''} key={`mv-emceephone-${plan.id}`} onBlur={(e) => updateMusicAVPlan(plan.id, { emceePhone: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`mv-mics-${plan.id}`}>Microphone count</Label>
          <Input
            id={`mv-mics-${plan.id}`}
            type="number"
            min={0}
            defaultValue={plan.microphoneCount ?? ''}
            key={`mv-mics-${plan.id}-${plan.microphoneCount}`}
            onBlur={(e) => updateMusicAVPlan(plan.id, { microphoneCount: numberOrUndefined(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`mv-backupmics-${plan.id}`}>Backup microphones</Label>
          <Input
            id={`mv-backupmics-${plan.id}`}
            type="number"
            min={0}
            defaultValue={plan.backupMicrophones ?? ''}
            key={`mv-backupmics-${plan.id}-${plan.backupMicrophones}`}
            onBlur={(e) => updateMusicAVPlan(plan.id, { backupMicrophones: numberOrUndefined(e.target.value) })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`mv-scdate-${plan.id}`}>Soundcheck date</Label>
          <Input id={`mv-scdate-${plan.id}`} type="date" defaultValue={plan.soundcheckDate ?? ''} key={`mv-scdate-${plan.id}`} onBlur={(e) => updateMusicAVPlan(plan.id, { soundcheckDate: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`mv-sctime-${plan.id}`}>Soundcheck time</Label>
          <Input id={`mv-sctime-${plan.id}`} type="time" defaultValue={plan.soundcheckTime ?? ''} key={`mv-sctime-${plan.id}`} onBlur={(e) => updateMusicAVPlan(plan.id, { soundcheckTime: e.target.value || undefined })} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={plan.podiumRequired} onChange={(e) => updateMusicAVPlan(plan.id, { podiumRequired: e.target.checked })} className="size-4 accent-brand-700" />
          Podium required
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={plan.offlinePlaylistReady} onChange={(e) => updateMusicAVPlan(plan.id, { offlinePlaylistReady: e.target.checked })} className="size-4 accent-brand-700" />
          Offline playlist ready
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={plan.backupBatteriesReady} onChange={(e) => updateMusicAVPlan(plan.id, { backupBatteriesReady: e.target.checked })} className="size-4 accent-brand-700" />
          Backup batteries ready
        </label>
      </div>

      <Field>
        <Label htmlFor={`mv-notes-${plan.id}`}>Notes</Label>
        <Textarea id={`mv-notes-${plan.id}`} defaultValue={plan.notes ?? ''} key={`mv-notes-${plan.id}`} onBlur={(e) => updateMusicAVPlan(plan.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete music/AV plan"
        message="Delete this music/AV plan? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteMusicAVPlan(plan.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function MusicAVView() {
  const { musicAVPlans, addMusicAVPlan } = useMusicAVPlans();
  const { musicCues, addMusicCue } = useMusicCues();
  const [newCueTitle, setNewCueTitle] = useState('');

  const handleAddPlan = () => {
    addMusicAVPlan({ event: 'Wedding', podiumRequired: false, offlinePlaylistReady: false, backupBatteriesReady: false });
  };

  const handleAddCue = () => {
    if (!newCueTitle.trim()) return;
    addMusicCue({ event: 'Wedding', cueType: 'Other', title: newCueTitle.trim(), sequenceOrder: musicCues.length + 1, approved: false, backupAvailable: false });
    setNewCueTitle('');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Music / AV plans ({musicAVPlans.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {musicAVPlans.length === 0 ? (
            <EmptyState title="No music/AV plans yet" description="Add a plan to track choir, DJ, AV vendors, and emcee logistics." />
          ) : (
            <div className="space-y-3">
              {musicAVPlans.map((p) => (
                <PlanCard key={p.id} planId={p.id} />
              ))}
            </div>
          )}
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddPlan}>
            Add Music/AV Plan
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Music cues ({musicCues.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {musicCues.length === 0 ? (
            <EmptyState title="No music cues yet" description="Add cues for processional, hymns, first dance, and more." />
          ) : (
            <div className="space-y-2.5">
              {musicCues.map((c) => (
                <CueRow key={c.id} cueId={c.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newCueTitle} onChange={(e) => setNewCueTitle(e.target.value)} placeholder="New cue title…" aria-label="New cue title" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddCue} disabled={!newCueTitle.trim()}>
              Add Cue
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
