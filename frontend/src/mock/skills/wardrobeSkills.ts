// Wardrobe Agent Skills
// This file defines the lightweight skills representing the Wardrobe Agent's capabilities.
import type { Child, WardrobeItem } from '../../types';
import { emmaWardrobe, miaWardrobe } from '../wardrobe';

/**
 * Skill: Retrieve Wardrobe Items
 * Retrieves all items in the child's wardrobe.
 */
export function retrieveWardrobeItems(child: Child): WardrobeItem[] {
  return child.id === 'emma' ? emmaWardrobe : miaWardrobe;
}

/**
 * Skill: Group Clothing by Category
 * Groups a list of wardrobe items by their category slot.
 */
export function groupItemsByCategory(items: WardrobeItem[]): Record<string, WardrobeItem[]> {
  const grouped: Record<string, WardrobeItem[]> = {};
  items.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });
  return grouped;
}

/**
 * Skill: Filter Sensory-Unsafe Clothing
 * Filters out any items that trigger a child's sensory dislikes.
 */
export function filterSensoryUnsafeItems(items: WardrobeItem[], sensoryDislikes: string[]): WardrobeItem[] {
  return items.filter(item => {
    return !item.tags.some(tag => 
      sensoryDislikes.some(dislike => tag.toLowerCase() === dislike.toLowerCase())
    );
  });
}
