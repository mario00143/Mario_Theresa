import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, Input, Label, Select } from '@/components/ui/Field';
import { useUI, type QuickAddMode } from '@/context/UIContext';
import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { useOwners } from '@/hooks/useOwners';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useHotels } from '@/hooks/useHotels';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useVendors } from '@/hooks/useVendors';
import { useBudgetCategories, useBudgetItems } from '@/hooks/useBudget';
import { usePayments } from '@/hooks/usePayments';
import { useSettings } from '@/hooks/useSettings';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { InvalidPaymentAmountError, PaymentLinkedEntityNotFoundError } from '@/data/repositories/paymentRepository';
import { todayISO } from '@/utils/date';
import {
  PRIORITIES,
  HOUSEHOLD_SIDES,
  AGE_CATEGORIES,
  TRAVEL_DIRECTIONS,
  ROUTE_TYPES,
  VENDOR_CATEGORIES,
  PAYMENT_METHODS,
  CHURCH_REQUIREMENT_CATEGORIES,
  CEREMONY_ITEM_CATEGORIES,
  GIFT_RECIPIENT_TYPES,
  RUN_SHEET_CATEGORIES,
  LIVE_ISSUE_CATEGORIES,
  LIVE_ISSUE_SEVERITIES,
  DUTY_ROLES,
  type TravelDirection,
  type RouteType,
  type VendorCategory,
  type PaymentMethod,
  type ChurchRequirementCategory,
  type CeremonyItemCategory,
  type GiftRecipientType,
  type RunSheetCategory,
  type LiveIssueCategory,
  type LiveIssueSeverity,
  type DutyRole,
} from '@/types';

const MODE_LABELS: Record<QuickAddMode, string> = {
  task: 'New Task',
  decision: 'New Decision',
  household: 'New Household',
  guest: 'New Guest',
  travel: 'New Travel',
  hotel: 'New Hotel',
  route: 'New Route',
  vendor: 'New Vendor',
  budgetItem: 'New Budget Item',
  payment: 'New Payment',
  churchRequirement: 'New Church Requirement',
  ceremonyItem: 'New Ceremony Item',
  giftPlan: 'New Gift Plan',
  runSheetItem: 'New Run Sheet Item',
  liveIssue: 'New Live Issue',
  dutyAssignment: 'New Duty Assignment',
};

export function QuickAddModal() {
  const {
    quickAddOpen,
    quickAddMode,
    closeQuickAdd,
    openTaskDetail,
    openDecisionDetail,
    openHouseholdDetail,
    openGuestDetail,
    openTravelDetail,
    openVendorDetail,
  } = useUI();
  const navigate = useNavigate();
  const { addTask } = useTasks();
  const { addDecision } = useDecisions();
  const { owners } = useOwners();
  const { households, addHousehold } = useHouseholds();
  const { guests, addGuest } = useGuests();
  const { addTravelSegment } = useTravel();
  const { addHotel } = useHotels();
  const { addTransportRoute } = useTransportRoutes();
  const { vendors, addVendor } = useVendors();
  const { budgetCategories } = useBudgetCategories();
  const { addBudgetItem } = useBudgetItems();
  const { addPayment } = usePayments();
  const { settings } = useSettings();
  const { churchProfiles } = useChurchProfiles();
  const { addChurchRequirement } = useChurchRequirements();
  const { addCeremonyItem } = useCeremonyItems();
  const { addGiftPlan } = useGiftPlans();
  const { addRunSheetItem } = useRunSheet();
  const { addLiveIssue } = useLiveIssues();
  const { addDutyAssignment } = useDutyAssignments();

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

  // Travel fields
  const [travelGuestId, setTravelGuestId] = useState('');
  const [travelDirection, setTravelDirection] = useState<TravelDirection>('Arrival');
  const [travelOrigin, setTravelOrigin] = useState('');
  const [travelDestination, setTravelDestination] = useState('');

  // Hotel fields
  const [hotelName, setHotelName] = useState('');
  const [hotelCity, setHotelCity] = useState('');

  // Transport route fields
  const [routeName, setRouteName] = useState('');
  const [routeType, setRouteType] = useState<RouteType>('Airport Pickup');
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDestination, setRouteDestination] = useState('');

  // Vendor fields
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState<VendorCategory>(VENDOR_CATEGORIES[0]);

  // Budget item fields
  const [budgetItemCategoryId, setBudgetItemCategoryId] = useState('');
  const [budgetItemName, setBudgetItemName] = useState('');
  const [budgetItemAmount, setBudgetItemAmount] = useState('');

  // Payment fields
  const [paymentVendorId, setPaymentVendorId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Church requirement fields
  const [churchRequirementTitle, setChurchRequirementTitle] = useState('');
  const [churchRequirementCategory, setChurchRequirementCategory] = useState<ChurchRequirementCategory>(CHURCH_REQUIREMENT_CATEGORIES[0]);

  // Ceremony item fields
  const [ceremonyItemName, setCeremonyItemName] = useState('');
  const [ceremonyItemCategory, setCeremonyItemCategory] = useState<CeremonyItemCategory>(CEREMONY_ITEM_CATEGORIES[0]);

  // Gift plan fields
  const [giftPlanRecipientType, setGiftPlanRecipientType] = useState<GiftRecipientType>(GIFT_RECIPIENT_TYPES[0]);
  const [giftPlanGiftType, setGiftPlanGiftType] = useState('');

  // Run sheet item fields
  const [runSheetActivity, setRunSheetActivity] = useState('');
  const [runSheetCategory, setRunSheetCategory] = useState<RunSheetCategory>(RUN_SHEET_CATEGORIES[0]);

  // Live issue fields
  const [liveIssueTitle, setLiveIssueTitle] = useState('');
  const [liveIssueSeverity, setLiveIssueSeverity] = useState<LiveIssueSeverity>('Medium');
  const [liveIssueCategory, setLiveIssueCategory] = useState<LiveIssueCategory>(LIVE_ISSUE_CATEGORIES[0]);
  const [liveIssueOwner, setLiveIssueOwner] = useState('');
  const [liveIssueLocation, setLiveIssueLocation] = useState('');

  // Duty assignment fields
  const [dutyRole, setDutyRole] = useState<DutyRole>(DUTY_ROLES[0]);
  const [dutyPersonName, setDutyPersonName] = useState('');

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
    setTravelGuestId('');
    setTravelDirection('Arrival');
    setTravelOrigin('');
    setTravelDestination('');
    setHotelName('');
    setHotelCity('');
    setRouteName('');
    setRouteType('Airport Pickup');
    setRouteOrigin('');
    setRouteDestination('');
    setVendorName('');
    setVendorCategory(VENDOR_CATEGORIES[0]);
    setBudgetItemCategoryId('');
    setBudgetItemName('');
    setBudgetItemAmount('');
    setPaymentVendorId('');
    setPaymentAmount('');
    setPaymentDate(todayISO());
    setPaymentMethod('Bank Transfer');
    setPaymentError(null);
    setChurchRequirementTitle('');
    setChurchRequirementCategory(CHURCH_REQUIREMENT_CATEGORIES[0]);
    setCeremonyItemName('');
    setCeremonyItemCategory(CEREMONY_ITEM_CATEGORIES[0]);
    setGiftPlanRecipientType(GIFT_RECIPIENT_TYPES[0]);
    setGiftPlanGiftType('');
    setRunSheetActivity('');
    setRunSheetCategory(RUN_SHEET_CATEGORIES[0]);
    setLiveIssueTitle('');
    setLiveIssueSeverity('Medium');
    setLiveIssueCategory(LIVE_ISSUE_CATEGORIES[0]);
    setLiveIssueOwner('');
    setLiveIssueLocation('');
    setDutyRole(DUTY_ROLES[0]);
    setDutyPersonName('');
    closeQuickAdd();
  };

  useEffect(() => {
    if (quickAddOpen) setMode(quickAddMode);
  }, [quickAddOpen, quickAddMode]);

  const isValid =
    (mode === 'task' && title.trim().length > 0) ||
    (mode === 'decision' && title.trim().length > 0) ||
    (mode === 'household' && householdName.trim().length > 0 && primaryContactName.trim().length > 0) ||
    (mode === 'guest' && guestName.trim().length > 0 && guestHouseholdId.length > 0) ||
    (mode === 'travel' && travelGuestId.length > 0 && travelOrigin.trim().length > 0 && travelDestination.trim().length > 0) ||
    (mode === 'hotel' && hotelName.trim().length > 0 && hotelCity.trim().length > 0) ||
    (mode === 'route' && routeName.trim().length > 0 && routeOrigin.trim().length > 0 && routeDestination.trim().length > 0) ||
    (mode === 'vendor' && vendorName.trim().length > 0) ||
    (mode === 'budgetItem' && budgetItemCategoryId.length > 0 && budgetItemName.trim().length > 0) ||
    (mode === 'payment' && paymentVendorId.length > 0 && Number(paymentAmount) > 0 && paymentDate.trim().length > 0) ||
    (mode === 'churchRequirement' && churchRequirementTitle.trim().length > 0 && churchProfiles.length > 0) ||
    (mode === 'ceremonyItem' && ceremonyItemName.trim().length > 0) ||
    (mode === 'giftPlan' && giftPlanGiftType.trim().length > 0) ||
    (mode === 'runSheetItem' && runSheetActivity.trim().length > 0) ||
    (mode === 'liveIssue' && liveIssueTitle.trim().length > 0) ||
    (mode === 'dutyAssignment' && dutyPersonName.trim().length > 0);

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
    } else if (mode === 'guest') {
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
    } else if (mode === 'travel') {
      if (!travelGuestId || !travelOrigin.trim() || !travelDestination.trim()) return;
      const guest = guests.find((g) => g.id === travelGuestId);
      if (!guest) return;
      const segment = addTravelSegment({
        guestId: travelGuestId,
        householdId: guest.householdId,
        event: 'Wedding',
        direction: travelDirection,
        travelMode: 'Flight',
        origin: travelOrigin.trim(),
        destination: travelDestination.trim(),
        bookingStatus: 'Not Booked',
        ticketConfirmed: false,
        pickupRequired: false,
        dropRequired: false,
      });
      resetAndClose();
      openTravelDetail(segment.id);
    } else if (mode === 'hotel') {
      if (!hotelName.trim() || !hotelCity.trim()) return;
      addHotel({
        name: hotelName.trim(),
        area: '',
        city: hotelCity.trim(),
        breakfastIncluded: false,
        parkingAvailable: false,
        busAccess: false,
        accessibleRoomsAvailable: false,
      });
      resetAndClose();
      navigate('/logistics/hotels');
    } else if (mode === 'route') {
      if (!routeName.trim() || !routeOrigin.trim() || !routeDestination.trim()) return;
      addTransportRoute({
        name: routeName.trim(),
        event: 'Wedding',
        routeType,
        origin: routeOrigin.trim(),
        destination: routeDestination.trim(),
        status: 'Planned',
      });
      resetAndClose();
      navigate('/logistics/transport');
    } else if (mode === 'vendor') {
      if (!vendorName.trim()) return;
      const vendor = addVendor({
        name: vendorName.trim(),
        category: vendorCategory,
        status: 'Researching',
        event: 'Wedding',
        gstApplicable: false,
      });
      resetAndClose();
      openVendorDetail(vendor.id);
    } else if (mode === 'budgetItem') {
      if (!budgetItemCategoryId || !budgetItemName.trim()) return;
      addBudgetItem({
        categoryId: budgetItemCategoryId,
        event: 'Wedding',
        itemName: budgetItemName.trim(),
        originalBudget: Number(budgetItemAmount) || 0,
        approvalStatus: 'Draft',
      });
      resetAndClose();
      navigate('/vendors/budget');
    } else if (mode === 'payment') {
      const amount = Number(paymentAmount);
      if (!paymentVendorId || !(amount > 0) || !paymentDate.trim()) return;
      try {
        addPayment({
          vendorId: paymentVendorId,
          paymentDate,
          amount,
          paymentMethod,
          invoiceReceived: false,
          receiptReceived: false,
        });
        resetAndClose();
        openVendorDetail(paymentVendorId);
      } catch (err) {
        if (err instanceof InvalidPaymentAmountError || err instanceof PaymentLinkedEntityNotFoundError) {
          setPaymentError(err.message);
        } else {
          setPaymentError('Could not record this payment.');
        }
      }
    } else if (mode === 'churchRequirement') {
      if (!churchRequirementTitle.trim() || churchProfiles.length === 0) return;
      addChurchRequirement({
        churchProfileId: churchProfiles[0].id,
        title: churchRequirementTitle.trim(),
        category: churchRequirementCategory,
        applicability: 'Applicable',
        status: 'Not Started',
        documentRequired: false,
      });
      resetAndClose();
      navigate('/wedding-prep/church');
    } else if (mode === 'ceremonyItem') {
      if (!ceremonyItemName.trim()) return;
      addCeremonyItem({
        name: ceremonyItemName.trim(),
        category: ceremonyItemCategory,
        applicability: 'Applicable',
        status: 'Not Procured',
        verificationStatus: 'Not Verified',
      });
      resetAndClose();
      navigate('/wedding-prep/ceremony-items');
    } else if (mode === 'giftPlan') {
      if (!giftPlanGiftType.trim()) return;
      addGiftPlan({
        recipientType: giftPlanRecipientType,
        event: 'Wedding',
        giftType: giftPlanGiftType.trim(),
        quantity: 1,
        status: 'Planned',
      });
      resetAndClose();
      navigate('/wedding-prep/gifts-kits');
    } else if (mode === 'runSheetItem') {
      if (!runSheetActivity.trim()) return;
      addRunSheetItem({
        event: 'Wedding',
        date: settings.wedding.date,
        relativeReference: 'None',
        activity: runSheetActivity.trim(),
        category: runSheetCategory,
        status: 'Planned',
      });
      resetAndClose();
      navigate('/wedding-day/run-sheet');
    } else if (mode === 'liveIssue') {
      if (!liveIssueTitle.trim()) return;
      addLiveIssue({
        title: liveIssueTitle.trim(),
        category: liveIssueCategory,
        severity: liveIssueSeverity,
        status: 'Open',
        reportedAt: new Date().toISOString(),
        owner: liveIssueOwner.trim() || undefined,
        location: liveIssueLocation.trim() || undefined,
        followUpRequired: false,
      });
      resetAndClose();
      navigate('/wedding-day/issues');
    } else if (mode === 'dutyAssignment') {
      if (!dutyPersonName.trim()) return;
      addDutyAssignment({
        role: dutyRole,
        personName: dutyPersonName.trim(),
        status: 'Planned',
      });
      resetAndClose();
      navigate('/wedding-day/duties');
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
            Create {MODE_LABELS[mode].replace('New ', '')}
          </Button>
        </>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-line p-1 sm:grid-cols-5">
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

      {mode === 'travel' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-travel-guest" required>
              Guest
            </Label>
            <Select id="quick-add-travel-guest" value={travelGuestId} onChange={(e) => setTravelGuestId(e.target.value)}>
              <option value="">Select a guest…</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="quick-add-travel-direction">Direction</Label>
            <Select id="quick-add-travel-direction" value={travelDirection} onChange={(e) => setTravelDirection(e.target.value as TravelDirection)}>
              {TRAVEL_DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="quick-add-travel-origin" required>
                Origin
              </Label>
              <Input id="quick-add-travel-origin" value={travelOrigin} onChange={(e) => setTravelOrigin(e.target.value)} placeholder="e.g. Kochi" autoFocus />
            </Field>
            <Field>
              <Label htmlFor="quick-add-travel-destination" required>
                Destination
              </Label>
              <Input id="quick-add-travel-destination" value={travelDestination} onChange={(e) => setTravelDestination(e.target.value)} placeholder="e.g. RGIA (Hyderabad Airport)" />
            </Field>
          </div>
          <p className="text-xs text-ink-faint">You can edit mode, schedule, booking, and pickup/drop needs right after creating this travel segment.</p>
        </div>
      )}

      {mode === 'hotel' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-hotel-name" required>
              Hotel name
            </Label>
            <Input id="quick-add-hotel-name" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="e.g. Marigold Grand Hyderabad" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-hotel-city" required>
              City
            </Label>
            <Input id="quick-add-hotel-city" value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} placeholder="e.g. Hyderabad" />
          </Field>
          <p className="text-xs text-ink-faint">You can add room types and rooms right after creating this hotel.</p>
        </div>
      )}

      {mode === 'route' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-route-name" required>
              Route name
            </Label>
            <Input id="quick-add-route-name" value={routeName} onChange={(e) => setRouteName(e.target.value)} placeholder="e.g. RGIA Morning Pickup" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-route-type">Route type</Label>
            <Select id="quick-add-route-type" value={routeType} onChange={(e) => setRouteType(e.target.value as RouteType)}>
              {ROUTE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="quick-add-route-origin" required>
                Origin
              </Label>
              <Input id="quick-add-route-origin" value={routeOrigin} onChange={(e) => setRouteOrigin(e.target.value)} placeholder="e.g. RGIA (Hyderabad Airport)" />
            </Field>
            <Field>
              <Label htmlFor="quick-add-route-destination" required>
                Destination
              </Label>
              <Input id="quick-add-route-destination" value={routeDestination} onChange={(e) => setRouteDestination(e.target.value)} placeholder="e.g. Hotel name" />
            </Field>
          </div>
          <p className="text-xs text-ink-faint">You can assign a vehicle and driver right after creating this route.</p>
        </div>
      )}

      {mode === 'vendor' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-vendor-name" required>
              Vendor name
            </Label>
            <Input id="quick-add-vendor-name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="e.g. Fernwood Décor Studio" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-vendor-category">Category</Label>
            <Select id="quick-add-vendor-category" value={vendorCategory} onChange={(e) => setVendorCategory(e.target.value as VendorCategory)}>
              {VENDOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-ink-faint">Starts as "Researching". You can add contacts, quotes, and a contract right after creating this vendor.</p>
        </div>
      )}

      {mode === 'budgetItem' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-budget-category" required>
              Category
            </Label>
            <Select id="quick-add-budget-category" value={budgetItemCategoryId} onChange={(e) => setBudgetItemCategoryId(e.target.value)}>
              <option value="">Select a category…</option>
              {budgetCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="quick-add-budget-item-name" required>
              Item name
            </Label>
            <Input id="quick-add-budget-item-name" value={budgetItemName} onChange={(e) => setBudgetItemName(e.target.value)} placeholder="e.g. Stage backdrop" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-budget-item-amount">Original budget</Label>
            <Input id="quick-add-budget-item-amount" type="number" min={0} value={budgetItemAmount} onChange={(e) => setBudgetItemAmount(e.target.value)} placeholder="0" />
          </Field>
          <p className="text-xs text-ink-faint">You can link a vendor and set forecast/committed/actual amounts right after creating this item.</p>
        </div>
      )}

      {mode === 'payment' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-payment-vendor" required>
              Vendor
            </Label>
            <Select id="quick-add-payment-vendor" value={paymentVendorId} onChange={(e) => setPaymentVendorId(e.target.value)} autoFocus>
              <option value="">Select a vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="quick-add-payment-amount" required>
                Amount
              </Label>
              <Input id="quick-add-payment-amount" type="number" min={0} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="quick-add-payment-date" required>
                Payment date
              </Label>
              <Input id="quick-add-payment-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </Field>
          </div>
          <Field>
            <Label htmlFor="quick-add-payment-method">Payment method</Label>
            <Select id="quick-add-payment-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          {paymentMethod === 'Cash' && Number(paymentAmount) >= settings.finance.largeCashWarningThreshold && (
            <p className="text-xs text-warning">This is a large cash payment (≥ the configured threshold). Consider a traceable method.</p>
          )}
          <FieldError>{paymentError}</FieldError>
          <p className="text-xs text-ink-faint">You can link a budget item or payment schedule, and add invoice/receipt details, right after recording this payment.</p>
        </div>
      )}

      {mode === 'churchRequirement' && (
        <div className="space-y-3">
          {churchProfiles.length === 0 && <p className="text-xs text-warning">Add a church profile in Wedding Prep &gt; Church before adding requirements.</p>}
          <Field>
            <Label htmlFor="quick-add-church-requirement-title" required>
              Title
            </Label>
            <Input
              id="quick-add-church-requirement-title"
              value={churchRequirementTitle}
              onChange={(e) => setChurchRequirementTitle(e.target.value)}
              placeholder="e.g. Submit baptism certificate"
              autoFocus
            />
          </Field>
          <Field>
            <Label htmlFor="quick-add-church-requirement-category">Category</Label>
            <Select
              id="quick-add-church-requirement-category"
              value={churchRequirementCategory}
              onChange={(e) => setChurchRequirementCategory(e.target.value as ChurchRequirementCategory)}
            >
              {CHURCH_REQUIREMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-ink-faint">Starts as Applicable / Not Started. You can edit applicability, owner, due date, and documents right after creating this requirement.</p>
        </div>
      )}

      {mode === 'ceremonyItem' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-ceremony-item-name" required>
              Item name
            </Label>
            <Input id="quick-add-ceremony-item-name" value={ceremonyItemName} onChange={(e) => setCeremonyItemName(e.target.value)} placeholder="e.g. Unity candle" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-ceremony-item-category">Category</Label>
            <Select id="quick-add-ceremony-item-category" value={ceremonyItemCategory} onChange={(e) => setCeremonyItemCategory(e.target.value as CeremonyItemCategory)}>
              {CEREMONY_ITEM_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-ink-faint">Starts as Applicable / Not Procured / Not Verified. You can edit custodian, storage, and required date right after creating this item.</p>
        </div>
      )}

      {mode === 'giftPlan' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-gift-recipient-type">Recipient type</Label>
            <Select id="quick-add-gift-recipient-type" value={giftPlanRecipientType} onChange={(e) => setGiftPlanRecipientType(e.target.value as GiftRecipientType)}>
              {GIFT_RECIPIENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="quick-add-gift-type" required>
              Gift type
            </Label>
            <Input id="quick-add-gift-type" value={giftPlanGiftType} onChange={(e) => setGiftPlanGiftType(e.target.value)} placeholder="e.g. Silver photo frame" autoFocus />
          </Field>
          <p className="text-xs text-ink-faint">Starts as Planned with quantity 1. You can edit quantity, custodian, and distribution owner right after creating this gift plan.</p>
        </div>
      )}

      {mode === 'runSheetItem' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-run-sheet-activity" required>
              Activity
            </Label>
            <Input id="quick-add-run-sheet-activity" value={runSheetActivity} onChange={(e) => setRunSheetActivity(e.target.value)} placeholder="e.g. Bridal party photos" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-run-sheet-category">Category</Label>
            <Select id="quick-add-run-sheet-category" value={runSheetCategory} onChange={(e) => setRunSheetCategory(e.target.value as RunSheetCategory)}>
              {RUN_SHEET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-ink-faint">Starts as Planned with no fixed time. You can set the time, owner, and links right after creating this item.</p>
        </div>
      )}

      {mode === 'liveIssue' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-live-issue-title" required>
              Title
            </Label>
            <Input id="quick-add-live-issue-title" value={liveIssueTitle} onChange={(e) => setLiveIssueTitle(e.target.value)} placeholder="e.g. Sound system feedback at podium" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="quick-add-live-issue-severity">Severity</Label>
            <Select id="quick-add-live-issue-severity" value={liveIssueSeverity} onChange={(e) => setLiveIssueSeverity(e.target.value as LiveIssueSeverity)}>
              {LIVE_ISSUE_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="quick-add-live-issue-category">Category</Label>
            <Select id="quick-add-live-issue-category" value={liveIssueCategory} onChange={(e) => setLiveIssueCategory(e.target.value as LiveIssueCategory)}>
              {LIVE_ISSUE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="quick-add-live-issue-owner">Owner</Label>
            <Input id="quick-add-live-issue-owner" value={liveIssueOwner} onChange={(e) => setLiveIssueOwner(e.target.value)} placeholder="Optional" />
          </Field>
          <Field>
            <Label htmlFor="quick-add-live-issue-location">Location</Label>
            <Input id="quick-add-live-issue-location" value={liveIssueLocation} onChange={(e) => setLiveIssueLocation(e.target.value)} placeholder="Optional" />
          </Field>
          <p className="text-xs text-ink-faint">Starts as Open. You can add mitigation notes, escalate severity, or resolve it right after creating this issue.</p>
        </div>
      )}

      {mode === 'dutyAssignment' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="quick-add-duty-role">Role</Label>
            <Select id="quick-add-duty-role" value={dutyRole} onChange={(e) => setDutyRole(e.target.value as DutyRole)}>
              {DUTY_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="quick-add-duty-person-name" required>
              Person name
            </Label>
            <Input id="quick-add-duty-person-name" value={dutyPersonName} onChange={(e) => setDutyPersonName(e.target.value)} placeholder="e.g. Nikhil Thomas" autoFocus />
          </Field>
          <p className="text-xs text-ink-faint">Starts as Planned. You can add phone, backup, shift times, and location right after creating this duty.</p>
        </div>
      )}
    </Modal>
  );
}
