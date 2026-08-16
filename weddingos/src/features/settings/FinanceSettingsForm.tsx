import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Field, FieldError, FieldHint, Input, Label } from '@/components/ui/Field';
import { VENDOR_CATEGORIES, type VendorCategory } from '@/types';
import { useSettings } from '@/hooks/useSettings';

function nonNegative(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function FinanceSettingsForm() {
  const { settings, updateSettings } = useSettings();
  const finance = settings.finance;

  const toggleCriticalCategory = (category: VendorCategory) => {
    const next = finance.criticalVendorCategories.includes(category)
      ? finance.criticalVendorCategories.filter((c) => c !== category)
      : [...finance.criticalVendorCategories, category];
    updateSettings({ finance: { ...finance, criticalVendorCategories: next } });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Finance</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="fs-currency">Currency</Label>
            <Input
              id="fs-currency"
              defaultValue={finance.currency}
              key={`finance-currency-${finance.currency}`}
              onBlur={(e) => updateSettings({ finance: { ...finance, currency: e.target.value || 'INR' } })}
            />
          </Field>
          <Field>
            <Label htmlFor="fs-large-cash">Large cash warning threshold</Label>
            <Input
              id="fs-large-cash"
              type="number"
              min={0}
              defaultValue={finance.largeCashWarningThreshold}
              key={`finance-large-cash-${finance.largeCashWarningThreshold}`}
              onBlur={(e) => updateSettings({ finance: { ...finance, largeCashWarningThreshold: nonNegative(e.target.value) } })}
            />
            <FieldHint>Cash payments at or above this amount trigger a warning. Cannot be negative.</FieldHint>
            {finance.largeCashWarningThreshold < 0 && <FieldError>Threshold cannot be negative.</FieldError>}
          </Field>
          <Field>
            <Label htmlFor="fs-variance">Budget variance warning %</Label>
            <Input
              id="fs-variance"
              type="number"
              min={0}
              defaultValue={finance.budgetVarianceWarningPercent}
              key={`finance-variance-${finance.budgetVarianceWarningPercent}`}
              onBlur={(e) => updateSettings({ finance: { ...finance, budgetVarianceWarningPercent: nonNegative(e.target.value) } })}
            />
            <FieldHint>A category's forecast exceeding its plan by this percentage or more is flagged. Cannot be negative.</FieldHint>
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Critical vendor categories</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-xs text-ink-faint">
            Vendors in these categories get a reconfirmation alert if not reconfirmed within 72 hours of the wedding.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VENDOR_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={finance.criticalVendorCategories.includes(category)}
                  onChange={() => toggleCriticalCategory(category)}
                  className="size-4 accent-brand-700"
                />
                {category}
              </label>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
