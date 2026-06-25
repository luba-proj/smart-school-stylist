// School Context Agent Skills
// This file defines the lightweight skills representing the School Context Agent's capabilities.
import type { SchoolContext } from '../../types';

/**
 * Skill: Detect School Activity
 * Extracts the primary schedule activity for the day.
 */
export function detectSchoolActivity(school: SchoolContext): string {
  return school.activity;
}

/**
 * Skill: Apply PE/Gym, Picture Day, Art Class, Field Trip, and Regular Day Rules
 * Helper to determine the school day context flags.
 */
export function getActivityType(school: SchoolContext): {
  isPE: boolean;
  isArt: boolean;
  isFieldTrip: boolean;
  isPictureDay: boolean;
  isRegularDay: boolean;
} {
  const activity = school.activity.toLowerCase();
  const isPE = school.isPEDay || activity.includes('pe') || activity.includes('gym') || activity.includes('sports') || activity.includes('soccer');
  const isArt = activity.includes('art');
  const isFieldTrip = activity.includes('field');
  const isPictureDay = activity.includes('picture') || activity.includes('photo');
  const isRegularDay = !isPE && !isArt && !isFieldTrip && !isPictureDay;

  return { isPE, isArt, isFieldTrip, isPictureDay, isRegularDay };
}
