import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { DENOMINATIONS } from '@/types';
import { useSettings } from '@/hooks/useSettings';

export function EventDetailsForm() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Couple</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="s-groom">Groom name</Label>
            <Input
              id="s-groom"
              defaultValue={settings.couple.groomName}
              key={`groom-${settings.couple.groomName}`}
              onBlur={(e) => updateSettings({ couple: { ...settings.couple, groomName: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-bride">Bride name</Label>
            <Input
              id="s-bride"
              defaultValue={settings.couple.brideName}
              key={`bride-${settings.couple.brideName}`}
              onBlur={(e) => updateSettings({ couple: { ...settings.couple, brideName: e.target.value } })}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="s-eng-date">Date</Label>
            <Input
              id="s-eng-date"
              type="date"
              value={settings.engagement.date}
              onChange={(e) => updateSettings({ engagement: { ...settings.engagement, date: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-eng-time">Start time</Label>
            <Input
              id="s-eng-time"
              type="time"
              value={settings.engagement.startTime}
              onChange={(e) => updateSettings({ engagement: { ...settings.engagement, startTime: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-eng-location">Location</Label>
            <Input
              id="s-eng-location"
              defaultValue={settings.engagement.location}
              key={`eng-location-${settings.engagement.location}`}
              onBlur={(e) => updateSettings({ engagement: { ...settings.engagement, location: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-eng-venue">Venue</Label>
            <Input
              id="s-eng-venue"
              defaultValue={settings.engagement.venue}
              key={`eng-venue-${settings.engagement.venue}`}
              onBlur={(e) => updateSettings({ engagement: { ...settings.engagement, venue: e.target.value } })}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wedding</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="s-wed-date">Date</Label>
            <Input
              id="s-wed-date"
              type="date"
              value={settings.wedding.date}
              onChange={(e) => updateSettings({ wedding: { ...settings.wedding, date: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-wed-location">Location</Label>
            <Input
              id="s-wed-location"
              defaultValue={settings.wedding.location}
              key={`wed-location-${settings.wedding.location}`}
              onBlur={(e) => updateSettings({ wedding: { ...settings.wedding, location: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-wed-church">Church</Label>
            <Input
              id="s-wed-church"
              defaultValue={settings.wedding.church}
              key={`wed-church-${settings.wedding.church}`}
              onBlur={(e) => updateSettings({ wedding: { ...settings.wedding, church: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-wed-reception-venue">Reception venue</Label>
            <Input
              id="s-wed-reception-venue"
              defaultValue={settings.wedding.receptionVenue}
              key={`wed-reception-${settings.wedding.receptionVenue}`}
              onBlur={(e) => updateSettings({ wedding: { ...settings.wedding, receptionVenue: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-wed-ceremony-time">Ceremony time</Label>
            <Input
              id="s-wed-ceremony-time"
              type="time"
              value={settings.wedding.ceremonyTime}
              onChange={(e) => updateSettings({ wedding: { ...settings.wedding, ceremonyTime: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-wed-reception-time">Reception time</Label>
            <Input
              id="s-wed-reception-time"
              type="time"
              value={settings.wedding.receptionTime}
              onChange={(e) => updateSettings({ wedding: { ...settings.wedding, receptionTime: e.target.value } })}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wedding details</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="s-denomination">Denomination</Label>
            <Select
              id="s-denomination"
              value={settings.weddingDetails.denomination}
              onChange={(e) =>
                updateSettings({ weddingDetails: { ...settings.weddingDetails, denomination: e.target.value as typeof settings.weddingDetails.denomination } })
              }
            >
              {DENOMINATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="s-timezone">Timezone</Label>
            <Input
              id="s-timezone"
              defaultValue={settings.weddingDetails.timezone}
              key={`timezone-${settings.weddingDetails.timezone}`}
              onBlur={(e) => updateSettings({ weddingDetails: { ...settings.weddingDetails, timezone: e.target.value } })}
            />
          </Field>
          <Field>
            <Label htmlFor="s-target-guests">Target guest count</Label>
            <Input
              id="s-target-guests"
              type="number"
              min={0}
              value={settings.weddingDetails.targetGuestCount}
              onChange={(e) =>
                updateSettings({ weddingDetails: { ...settings.weddingDetails, targetGuestCount: Number(e.target.value) || 0 } })
              }
            />
          </Field>
          <Field>
            <Label htmlFor="s-max-guests">Maximum guest count</Label>
            <Input
              id="s-max-guests"
              type="number"
              min={0}
              value={settings.weddingDetails.maximumGuestCount}
              onChange={(e) =>
                updateSettings({ weddingDetails: { ...settings.weddingDetails, maximumGuestCount: Number(e.target.value) || 0 } })
              }
            />
          </Field>
          <Field>
            <Label htmlFor="s-budget">Overall budget</Label>
            <Input
              id="s-budget"
              type="number"
              min={0}
              value={settings.weddingDetails.overallBudget}
              onChange={(e) =>
                updateSettings({ weddingDetails: { ...settings.weddingDetails, overallBudget: Number(e.target.value) || 0 } })
              }
            />
          </Field>
          <Field>
            <Label htmlFor="s-currency">Currency</Label>
            <Input
              id="s-currency"
              defaultValue={settings.weddingDetails.currency}
              key={`currency-${settings.weddingDetails.currency}`}
              onBlur={(e) => updateSettings({ weddingDetails: { ...settings.weddingDetails, currency: e.target.value } })}
            />
          </Field>
        </CardBody>
      </Card>
    </div>
  );
}
