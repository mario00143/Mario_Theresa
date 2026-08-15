import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { useUI, type QuickAddMode } from '@/context/UIContext';
import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { useOwners } from '@/hooks/useOwners';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { PRIORITIES, HOUSEHOLD_SIDES, AGE_CATEGORIES } from '@/types';

const MODE_LABELS: Record<QuickAddMode, string> = {
  task: 'New Task',
  decision: 'New Decision',
  household: 'New Household',
  guest: 'New Guest',
};

export function QuickAddModal() {
  const { quickAddOpen, quickAddMode, closeQuickAdd, openTaskDetail, openDecisionDetail, openHouseholdDetail, openGuestDetail } =
    useUI();
  const { addTask } = useTasks();
  const { addDecision } = useDecisions();
  const { owners } = useOwners();
  const { households, addHousehold } = useHouseholds();
  const { addGuest } = useGuests();

  const [mode, setMode] = useState<QuickAddMode>(quickAddMode);

  // Task / Decision fields
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('Medium');

  // Household fields
  const [householdName, setHouseholdName] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [side, setSide] = useState<(typeof HOUSEHOLD_SIDES)[number]>('Groom');

  // Guest fields
  const [guestName, setGuestName] = useState('');
  const [guestHouseholdId, setGuestHouseholdId] = useState('');
  const [ageCategory, setAgeCategory] = useState<(typeof AGE_CATEGORIES)[number]>('Adult');
  const [weddingInvited, setWeddingInvited] = useState(true);
  const [engagementInvited, setEngagementInvited] = useState(false);

  const resetAndClose = () => {
    setTitle('');
    setOwner('');
    setDueDate('');
    setPriority('Medium');
    setHouseholdName('');
    setPrimaryContactName('');
    setPrimaryPhone('');
    setSide('Groom');
    setGuestName('');
    setGuestHouseholdId('');
    setAgeCategory('Adult');
    setWeddingInvited(true);
    setEngagementInvited(false);
    closeQuickAdd();
  };

  useEffect(() => {
    if (quickAddOpen) setMode(quickAddMode);
  }, [quickAddOpen, quickAddMode]);

  const isValid =
    (mode === 'task' && title.trim().length > 0) ||
    (mode === 'decision' && title.trim().length > 0) ||
    (mode === 'household' && householdName.trim().length > 0 && primaryContactName.trim().length > 0) ||
    (mode === 'guest' && guestName.trim().length > 0 && guestHouseholdId.length > 0);

  const handleSubmit = () => {
    if (mode === 'task') {
      if (!title.trim()) return;
      const task = addTask({
        title: title.trim(),
        description: '',
        event: 'Wedding',
        workstream: 'Governance',
        owner: owner || 'Groom',
        status: 'Not Started',
        priority,
        dueDate: dueDate || undefined,
        completionCriteria: '',
      });
      resetAndClose();
      openTaskDetail(task.id);
    } else if (mode === 'decision') {
      if (!title.trim()) return;
      const decision = addDecision({
        title: title.trim(),
        description: '',
        category: 'Governance',
        owner: owner || 'Groom',
        options: [],
        deadline: dueDate || undefined,
        status: 'Open',
      });
      resetAndClose();
      openDecisionDetail(decision.id);
    } else if (mode === 'household') {
      if (!householdName.trim() || !primaryContactName.trim()) return;
      const household = addHousehold({
        householdName: householdName.trim(),
        primaryContactName: primaryContactName.trim(),
        primaryPhone: primaryPhone.trim(),
        side,
        relationshipCategory: 'Other',
        city: '',
        country: 'India',
        invitationPriority: 'Standard',
        invitationStatus: 'Not Prepared',
      });
      resetAndClose();
      openHouseholdDetail(household.id);
    } else {
      if (!guestName.trim() || !guestHouseholdId) return;
      const invitedEvents = [...(weddingInvited ? (['Wedding'] as const) : []), ...(engagementInvited ? (['Engagement'] as const) : [])];
      const guest = addGuest({
        householdId: guestHouseholdId,
        fullName: guestName.trim(),
        ageCategory,
        invitedEvents,
        dietaryPreference: 'Not Specified',
        elderlyAssistanceRequired: false,
        accommodationRequired: false,
        travelDetailsRequired: false,
        pickupRequired: false,
        plusOneStatus: 'Not Applicable',
      });
      resetAndClose();
      openGuestDetail(guest.id);
    }
  };

  return (
    <Modal
      open={quickAddOpen}
      onClose={resetAndClose}
      title="Quick Add"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            Create {mode === 'household' ? 'Household' : mode === 'guest' ? 'Guest' : mode === 'task' ? 'Task' : 'Decision'}
          </Button>
        </>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-line p-1 sm:grid-cols-4">
        {(Object.keys(MODE_LABELS) as QuickAddMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md py-1.5 text-xs font-medium ${mode === m ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {(mode === 'task' || mode === 'decision') && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-title" required>
              Title
            </Label>
            <Input
              id="quick-add-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'task' ? 'e.g. Confirm floral vendor pricing' : 'e.g. Select photography package'}
              autoFocus
            />
          </Field>

          <Field>
            <Label htmlFor="quick-add-owner">Owner</Label>
            <Select id="quick-add-owner" value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option value="">Unassigned</option>
              {owners.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label htmlFor="quick-add-date">{mode === 'task' ? 'Due date' : 'Deadline'}</Label>
            <Input id="quick-add-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>

          {mode === 'task' && (
            <Field>
              <Label htmlFor="quick-add-priority">Priority</Label>
              <Select id="quick-add-priority" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <p className="text-xs text-ink-faint">
            You can edit all remaining details right after creating this {mode}.
          </p>
        </div>
      )}

      {mode === 'household' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-household-name" required>
              Household name
            </Label>
            <Input
              id="quick-add-household-name"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g. Thomas Family"
              autoFocus
            />
          </Field>
          <Field>
            <Label htmlFor="quick-add-primary-contact" required>
              Primary contact
            </Label>
            <Input
              id="quick-add-primary-contact"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
              placeholder="e.g. Biju Thomas"
            />
          </Field>
          <Field>
            <Label htmlFor="quick-add-primary-phone">Phone</Label>
            <Input id="quick-add-primary-phone" value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} placeholder="+91 90000 00000" />
          </Field>
          <Field>
            <Label htmlFor="quick-add-side">Side</Label>
            <Select id="quick-add-side" value={side} onChange={(e) => setSide(e.target.value as typeof side)}>
              {HOUSEHOLD_SIDES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-ink-faint">You can edit city, relationship, invitation details and more right after creating this household.</p>
        </div>
      )}

      {mode === 'guest' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-guest-name" required>
              Full name
            </Label>
            <Input id="quick-add-guest-name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. Anu Thomas" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-guest-household" required>
              Household
            </Label>
            <Select id="quick-add-guest-household" value={guestHouseholdId} onChange={(e) => setGuestHouseholdId(e.target.value)}>
              <option value="">Select a household…</option>
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.householdName}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="quick-add-age-category">Age category</Label>
            <Select id="quick-add-age-category" value={ageCategory} onChange={(e) => setAgeCategory(e.target.value as typeof ageCategory)}>
              {AGE_CATEGORIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={weddingInvited} onChange={(e) => setWeddingInvited(e.target.checked)} className="size-4 accent-brand-700" />
              Wedding invited
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={engagementInvited} onChange={(e) => setEngagementInvited(e.target.checked)} className="size-4 accent-brand-700" />
              Engagement invited
            </label>
          </div>
          <p className="text-xs text-ink-faint">You can edit RSVP, dietary, hospitality and more right after creating this guest.</p>
        </div>
      )}
    </Modal>
  );
}
