// Profile Agent Skills
// This file defines the lightweight skills representing the Profile Agent's capabilities.
import type { Child } from '../../types';

/**
 * Skill: Load Child Profile
 * Retrieves the child's profile details.
 */
export function loadChildProfile(child: Child): Child {
  return child;
}

/**
 * Skill: Retrieve Favorite Colors
 * Extracts the favorite/signature colors for the child.
 */
export function getFavoriteColors(child: Child): string[] {
  if (child.id === 'emma') {
    return ['lavender', 'pink', 'purple'];
  } else {
    return ['teal', 'blue', 'black', 'grey', 'gray'];
  }
}

/**
 * Skill: Retrieve Sensory Preferences
 * Extracts the child's sensory dislikes.
 */
export function getSensoryPreferences(child: Child): string[] {
  return child.sensoryDislikes || [];
}
