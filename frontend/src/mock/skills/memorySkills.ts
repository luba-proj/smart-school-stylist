// Feedback Memory Agent Skills
// This file defines the lightweight skills representing the Feedback Memory Agent's capabilities.
import type { ChildFeedbackMemory, WardrobeItem } from '../../types';

/**
 * Skill: Load Previous Feedback
 * Retrieves the child's feedback history/memory.
 */
export function loadFeedbackMemory(memory?: ChildFeedbackMemory): ChildFeedbackMemory | undefined {
  return memory;
}

/**
 * Skill: Calculate Preference Adjustments
 * Computes weight/preference adjustments for items based on historical likes, colors, tags, and warmth feedback.
 */
export function calculatePreferenceScores(
  items: WardrobeItem[],
  memory?: ChildFeedbackMemory
): Record<string, number> {
  const preferenceScores: Record<string, number> = {};

  if (!memory) {
    items.forEach(item => {
      preferenceScores[item.id] = item.isFavorite ? 5 : 0;
    });
    return preferenceScores;
  }

  items.forEach(item => {
    let score = 0;

    if (item.isFavorite) {
      score += 5;
    }

    if (memory.likedColors.includes(item.color)) {
      score += 15;
    }

    const matchedTags = item.tags.filter(tag => memory.likedTags.includes(tag));
    if (matchedTags.length > 0) {
      score += matchedTags.length * 4;
    }

    if (memory.warmthOffset !== 0) {
      if (memory.warmthOffset > 0) {
        if (item.warmRating >= 3) {
          score += memory.warmthOffset * 6;
        } else if (item.warmRating <= 1) {
          score -= memory.warmthOffset * 5;
        }
      } else if (memory.warmthOffset < 0) {
        const absOffset = Math.abs(memory.warmthOffset);
        if (item.warmRating <= 2) {
          score += absOffset * 6;
        } else if (item.warmRating >= 3) {
          score -= absOffset * 5;
        }
      }
    }

    preferenceScores[item.id] = score;
  });

  return preferenceScores;
}
