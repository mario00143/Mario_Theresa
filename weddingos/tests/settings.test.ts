import { beforeEach, describe, expect, it } from 'vitest';
import { updateSettings } from '@/data/repositories/settingsRepository';
import { resetToDemoData, settingsStore } from '@/data/stores';

describe('settings updates', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('updates the wedding date while leaving other wedding fields untouched', () => {
    const before = settingsStore.get();
    const originalChurch = before.wedding.church;

    updateSettings({ wedding: { ...before.wedding, date: '2027-02-14' } });

    const after = settingsStore.get();
    expect(after.wedding.date).toBe('2027-02-14');
    expect(after.wedding.church).toBe(originalChurch);
  });

  it('updates the engagement date independently of the wedding date', () => {
    updateSettings({ engagement: { ...settingsStore.get().engagement, date: '2027-01-05' } });
    const after = settingsStore.get();
    expect(after.engagement.date).toBe('2027-01-05');
    expect(after.wedding.date).toBe('2027-01-30');
  });

  it('persists changes to localStorage so they survive a reload', () => {
    updateSettings({ couple: { ...settingsStore.get().couple, groomName: 'Test Groom' } });
    const raw = window.localStorage.getItem('weddingos:settings');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).couple.groomName).toBe('Test Groom');
  });

  it('merges a partial weddingDetails update without dropping other fields', () => {
    const before = settingsStore.get();
    updateSettings({ weddingDetails: { ...before.weddingDetails, overallBudget: 5000000 } });
    const after = settingsStore.get();
    expect(after.weddingDetails.overallBudget).toBe(5000000);
    expect(after.weddingDetails.currency).toBe(before.weddingDetails.currency);
  });

  it('updates a single wedding prep section weight without dropping the others', () => {
    const before = settingsStore.get();
    updateSettings({ weddingPrep: { sectionWeights: { ...before.weddingPrep.sectionWeights, church: 40 } } });
    const after = settingsStore.get();
    expect(after.weddingPrep.sectionWeights.church).toBe(40);
    expect(after.weddingPrep.sectionWeights.ceremony).toBe(before.weddingPrep.sectionWeights.ceremony);
  });
});
