// Stylist Agent Skills
// This file defines the lightweight skills representing the Stylist Agent's capabilities.
import type { Child, WeatherCondition, SchoolContext, WardrobeItem, ChildFeedbackMemory } from '../../types';

interface OutfitCombination {
  top: WardrobeItem | null;
  bottom: WardrobeItem;
  shoes: WardrobeItem;
  outerwear: WardrobeItem | null;
  accessory: WardrobeItem | null;
  score: number;
}

/**
 * Skill: Generate Outfit Candidates
 * Delegates the combinatorics of selecting tops, bottoms, shoes, outerwear, and accessories.
 */
export function buildCandidateOutfits(
  filteredItems: WardrobeItem[],
  weather: WeatherCondition,
  school: SchoolContext,
  child: Child,
  outerwearRequired: boolean,
  warmAccessoryRequired: boolean,
  isComfortCollection: boolean,
  buildFn: (
    items: WardrobeItem[],
    prefScores: Record<string, number>,
    weather: WeatherCondition,
    school: SchoolContext,
    mem: ChildFeedbackMemory | undefined,
    ch: Child,
    outRequired: boolean,
    accRequired: boolean,
    comfort: boolean
  ) => OutfitCombination[],
  preferenceScores: Record<string, number>,
  memory?: ChildFeedbackMemory
): OutfitCombination[] {
  return buildFn(
    filteredItems,
    preferenceScores,
    weather,
    school,
    memory,
    child,
    outerwearRequired,
    warmAccessoryRequired,
    isComfortCollection
  );
}

/**
 * Skill: Score Outfit Combinations
 * Computes the suitability score by delegating to the core scoring engine.
 */
export function scoreOutfit(
  top: WardrobeItem | null,
  bottom: WardrobeItem,
  shoes: WardrobeItem,
  outerwear: WardrobeItem | null,
  accessory: WardrobeItem | null,
  child: Child,
  school: SchoolContext,
  preferenceScores: Record<string, number>,
  memory: ChildFeedbackMemory | undefined,
  temp: number,
  scoreFn: (
    t: WardrobeItem | null,
    b: WardrobeItem,
    s: WardrobeItem,
    o: WardrobeItem | null,
    a: WardrobeItem | null,
    ch: Child,
    sch: SchoolContext,
    prefs: Record<string, number>,
    mem: ChildFeedbackMemory | undefined,
    tVal: number
  ) => number
): number {
  return scoreFn(top, bottom, shoes, outerwear, accessory, child, school, preferenceScores, memory, temp);
}

/**
 * Skill: Apply Fashion Coordination & Color Harmony
 * Mentions and documents how coordination/clashing rules are styled.
 */
export function applyFashionCoordination(): string {
  return "Fashion coordination skill active: enforcing style consistency and clashing checks.";
}

/**
 * Skill: Validate Clothing Structure
 * Ensures that basic outfit structure rules are met.
 */
export function validateOutfitStructure(outfit: OutfitCombination): boolean {
  if (outfit.bottom.category === 'dress') {
    return outfit.top === null;
  }
  return outfit.top !== null;
}

/**
 * Skill: Perform Final Parent Validation
 * Determines if the outfit meets parent safety expectations.
 */
export function performParentValidation(
  outfit: OutfitCombination,
  child: Child,
  weather: WeatherCondition,
  school: SchoolContext,
  validationFn: (
    out: {
      top: WardrobeItem | null;
      bottom: WardrobeItem;
      shoes: WardrobeItem;
      outerwear: WardrobeItem | null;
      accessory: WardrobeItem | null;
    },
    c: Child,
    w: WeatherCondition,
    s: SchoolContext
  ) => { passes: boolean; reason?: string }
): { passes: boolean; reason?: string } {
  return validationFn(outfit, child, weather, school);
}

/**
 * Skill: Rank Recommendations
 * Sorts outfit candidates by descending score.
 */
export function rankRecommendations(combinations: OutfitCombination[]): OutfitCombination[] {
  return [...combinations].sort((a, b) => b.score - a.score);
}
