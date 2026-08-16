import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Field, FieldHint, Input, Label } from '@/components/ui/Field';
import { useSettings } from '@/hooks/useSettings';
import type { WeddingPrepSectionWeights } from '@/types';

function nonNegative(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

const SECTION_LABELS: Record<keyof WeddingPrepSectionWeights, string> = {
  church: 'Church',
  ceremony: 'Ceremony',
  catering: 'Catering',
  decor: 'Décor',
  attire: 'Attire',
  photography: 'Photography & Video',
  musicAV: 'Music & AV',
  giftsKits: 'Gifts & Kits',
};

export function WeddingPrepSettingsForm() {
  const { settings, updateSettings } = useSettings();
  const weights = settings.weddingPrep.sectionWeights;
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  const setWeight = (key: keyof WeddingPrepSectionWeights, value: number) => {
    updateSettings({ weddingPrep: { ...settings.weddingPrep, sectionWeights: { ...weights, [key]: value } } });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Wedding prep readiness weights</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-ink-faint">
            Controls how each Wedding Prep section is weighted when combined into the overall readiness score on the Wedding Prep Overview and Readiness pages. Weights don't need to
            sum to 100 — only their relative size matters.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(SECTION_LABELS) as (keyof WeddingPrepSectionWeights)[]).map((key) => (
              <Field key={key}>
                <Label htmlFor={`wps-${key}`}>{SECTION_LABELS[key]}</Label>
                <Input
                  id={`wps-${key}`}
                  type="number"
                  min={0}
                  defaultValue={weights[key]}
                  key={`wps-${key}-${weights[key]}`}
                  onBlur={(e) => setWeight(key, nonNegative(e.target.value))}
                />
              </Field>
            ))}
          </div>
          <FieldHint>Current total: {total}. Cannot be negative.</FieldHint>
        </CardBody>
      </Card>
    </div>
  );
}
