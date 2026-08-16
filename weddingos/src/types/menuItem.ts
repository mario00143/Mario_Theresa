export const MENU_COURSES = [
  'Welcome Drink',
  'Starter',
  'Soup',
  'Main Course',
  'Rice',
  'Bread',
  'Accompaniment',
  'Dessert',
  'Cake',
  'Beverage',
  'Late Night Snack',
  'Other',
] as const;
export type MenuCourse = (typeof MENU_COURSES)[number];

export const MENU_DIETARY_TYPES = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Mixed', 'Other'] as const;
export type MenuDietaryType = (typeof MENU_DIETARY_TYPES)[number];

export const MENU_TASTING_STATUSES = ['Not Scheduled', 'Scheduled', 'Completed', 'Skipped'] as const;
export type MenuTastingStatus = (typeof MENU_TASTING_STATUSES)[number];

export interface MenuItem {
  id: string;
  cateringPlanId: string;
  course: MenuCourse;
  name: string;
  dietaryType: MenuDietaryType;
  allergens?: string;
  liveCounter: boolean;
  approved: boolean;
  tastingStatus: MenuTastingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
