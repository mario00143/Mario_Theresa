import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Field, FieldHint, Input, Label } from '@/components/ui/Field';
import { useSettings } from '@/hooks/useSettings';
import type { WeddingDaySettings } from '@/types';

function nonNegative(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

const FIELDS: { key: keyof Omit<WeddingDaySettings, 'weddingDayModeEnabled' | 'simulationDateTimeISO' | 'productionLaunchReview'>; label: string; hint: string }[] = [
  { key: 'commandCenterVisibilityDays', label: 'Command Center visibility (days before wedding)', hint: 'The Wedding Day Snapshot appears on the Dashboard within this many days of the wedding.' },
  { key: 'criticalIssueEscalationMinutes', label: 'Critical issue escalation (minutes)', hint: 'Warn when a Critical issue has been open longer than this.' },
  { key: 'highIssueEscalationMinutes', label: 'High issue escalation (minutes)', hint: 'Warn when a High issue has been open longer than this.' },
  { key: 'mediumIssueEscalationMinutes', label: 'Medium issue escalation (minutes)', hint: 'Warn when a Medium issue has been open longer than this.' },
  { key: 'vendorArrivalGraceMinutes', label: 'Vendor arrival grace period (minutes)', hint: 'A vendor is flagged late once this many minutes have passed their expected arrival.' },
  { key: 'arrivalClusteringWindowMinutes', label: 'Arrival clustering window (minutes)', hint: 'Window used to group nearby guest arrivals for manifests.' },
  { key: 'defaultCeremonyBufferMinutes', label: 'Default ceremony buffer (minutes)', hint: 'Default buffer applied around the ceremony start when checking for conflicts.' },
  { key: 'defaultReceptionBufferMinutes', label: 'Default reception buffer (minutes)', hint: 'Default buffer applied around the reception start when checking for conflicts.' },
];

export function WeddingDaySettingsForm() {
  const { settings, updateSettings } = useSettings();
  const weddingDay = settings.weddingDay;

  const set = (key: keyof WeddingDaySettings, value: number) => {
    updateSettings({ weddingDay: { ...weddingDay, [key]: value } });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Wedding day thresholds</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-ink-faint">
            Controls the timing thresholds used by the Command Center, issue escalation warnings, vendor lateness checks, and conflict detection. Sensible defaults are pre-filled —
            adjust only if needed.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map(({ key, label, hint }) => (
              <Field key={key}>
                <Label htmlFor={`wds-${key}`}>{label}</Label>
                <Input
                  id={`wds-${key}`}
                  type="number"
                  min={0}
                  defaultValue={weddingDay[key]}
                  key={`wds-${key}-${weddingDay[key]}`}
                  onBlur={(e) => set(key, nonNegative(e.target.value))}
                />
                <FieldHint>{hint}</FieldHint>
              </Field>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wedding Day Mode</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={weddingDay.weddingDayModeEnabled}
              onChange={(e) => updateSettings({ weddingDay: { ...weddingDay, weddingDayModeEnabled: e.target.checked } })}
              className="size-4 accent-brand-700"
            />
            Prioritize Command Center, Run Sheet, Issues, Manifests, and Emergency on mobile navigation
          </label>
          <p className="text-xs text-ink-faint">Also toggleable from the header on any page. Other modules stay reachable from the full sidebar and search.</p>
        </CardBody>
      </Card>
    </div>
  );
}
