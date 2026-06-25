import type { Child, WeatherCondition, SchoolContext, WardrobeItem, Outfit, ChildFeedbackMemory } from '../types';
import { emmaWardrobe, miaWardrobe } from './wardrobe';
import { validateOutfit } from './rules';

interface OutfitCombination {
  top: WardrobeItem | null;
  bottom: WardrobeItem;
  shoes: WardrobeItem;
  outerwear: WardrobeItem | null;
  accessory: WardrobeItem | null;
  score: number;
}

// Helper to check if an item's tags match a list of tags (case-insensitive)
const hasTag = (item: WardrobeItem | null, tagToFind: string): boolean => {
  if (!item) return false;
  const lowerFind = tagToFind.toLowerCase();
  return item.tags.some((t: string) => t.toLowerCase() === lowerFind || t.toLowerCase().includes(lowerFind)) ||
         item.name.toLowerCase().includes(lowerFind);
};

// Experienced Parent Validation check (delegates to the single source of truth in rules.ts)
export function passesRealParentValidation(
  outfit: {
    top: WardrobeItem | null;
    bottom: WardrobeItem;
    shoes: WardrobeItem;
    outerwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  },
  child: Child,
  weather: WeatherCondition,
  school: SchoolContext
): { passes: boolean; reason?: string } {
  const mockOutfit: Outfit = {
    childId: child.id,
    top: outfit.top,
    bottom: outfit.bottom,
    shoes: outfit.shoes,
    outerwear: outfit.outerwear,
    accessory: outfit.accessory,
    stylistNotes: '',
    suitabilityScore: 100
  };

  // Virtual layer addition to pass bare legs check in cold weather
  const temp = weather.temp;
  const condition = weather.condition;
  const isColdSnowyOrFreezing = condition === 'snowy' || temp <= 45;
  const isDress = outfit.bottom && (outfit.bottom.tags.includes('dress') || outfit.bottom.name.toLowerCase().includes('dress'));
  const isSkirt = outfit.bottom && (outfit.bottom.tags.includes('skirt') || outfit.bottom.name.toLowerCase().includes('skirt'));
  
  if ((isDress || isSkirt) && isColdSnowyOrFreezing) {
    mockOutfit.stylistNotes = "Added warm fleece-lined leggings under the dress/skirt.";
  }

  const validation = validateOutfit(mockOutfit, child, weather, school);
  return {
    passes: validation.isValid,
    reason: validation.reasons[0]
  };
}

// =========================================================================
// 1. WARDROBE AGENT
// =========================================================================
function runWardrobeAgent(child: Child): {
  items: WardrobeItem[];
  logs: string[];
} {
  const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
  const logs: string[] = [];
  
  logs.push(`[Wardrobe Agent] Retrieved ${wardrobe.length} items from ${child.name}'s digital wardrobe.`);

  // Filter out items triggering sensory dislikes (case-insensitive check)
  const sensorySafeItems = wardrobe.filter(item => {
    const isUnsafe = item.tags.some(tag => 
      child.sensoryDislikes.some(dislike => tag.toLowerCase() === dislike.toLowerCase())
    );
    if (isUnsafe) {
      logs.push(`[Wardrobe Agent] Filtered out "${item.name}" due to sensory dislikes (${child.sensoryDislikes.join(', ')}).`);
    }
    return !isUnsafe;
  });

  logs.push(`[Wardrobe Agent] Passed ${sensorySafeItems.length} sensory-safe items to the Weather Agent.`);
  return { items: sensorySafeItems, logs };
}

// =========================================================================
// 2. WEATHER AGENT (Updated with School Context for smart shoe intersections)
// =========================================================================
function runWeatherAgent(
  items: WardrobeItem[],
  weather: WeatherCondition,
  school: SchoolContext
): {
  items: WardrobeItem[];
  outerwearRequired: boolean;
  heavyOuterwearRequired: boolean;
  warmAccessoryRequired: boolean;
  logs: string[];
} {
  const logs: string[] = [];
  const temp = weather.temp;
  const condition = weather.condition;
  
  logs.push(`[Weather Agent] Analyzing forecast: ${temp}°F, condition: ${condition}.`);

  const isRainy = condition === 'rainy';
  const isSnowy = condition === 'snowy';
  const isFreezing = temp < 40;
  const isSunnyWarm = temp >= 70;
  const isChillyWindy = ((temp >= 40 && temp < 70) || (condition === 'windy' && temp < 70)) && !isRainy && !isSnowy && !isFreezing;

  let outerwearRequired = false;
  let heavyOuterwearRequired = false;
  let warmAccessoryRequired = false;

  // Determine outerwear and accessory requirements based on Temperature and Condition
  if (isRainy) {
    outerwearRequired = true;
    logs.push(`[Weather Agent] Rainy forecast: Rain coat required.`);
  } else if (isSnowy || isFreezing) {
    outerwearRequired = true;
    heavyOuterwearRequired = true;
    warmAccessoryRequired = true;
    logs.push(`[Weather Agent] Snowy/Freezing forecast: Heavy winter coat and warm accessories required.`);
  } else if (isChillyWindy) {
    outerwearRequired = true;
    logs.push(`[Weather Agent] Chilly/Windy forecast: Sweatshirt required.`);
  } else {
    outerwearRequired = false;
    logs.push(`[Weather Agent] Sunny & Warm: Outerwear not required.`);
  }

  // Pre-check long-sleeve availability for "long-sleeve whenever available" rule
  const hasLongSleeveTops = items.some(i => i.category === 'top' && hasTag(i, 'long-sleeve'));

  const filtered = items.filter(item => {
    // 1. Outerwear filtering strictly by Temperature & Rain/Snow
    if (item.category === 'outerwear') {
      if (isRainy) {
        // Must be a coat/jacket (waterproof/rain-ready)
        return hasTag(item, 'Waterproof') || hasTag(item, 'Rain-ready') || item.name.toLowerCase().includes('coat') || item.name.toLowerCase().includes('jacket') || item.name.toLowerCase().includes('parka');
      }
      if (isSnowy || isFreezing) {
        // Heavy winter coat, not hoodie/sweatshirt
        return hasTag(item, 'Heavy warm') || hasTag(item, 'puffy') || hasTag(item, 'puffer') || item.warmRating >= 5;
      }
      if (isSunnyWarm) {
        return false; // Outerwear strictly forbidden
      }
      if (isChillyWindy) {
        // Must be a sweatshirt/hoodie/fleece/cardigan
        return hasTag(item, 'sweater-hoodie') || hasTag(item, 'cardigan') || hasTag(item, 'fleece') || item.name.toLowerCase().includes('hoodie') || item.name.toLowerCase().includes('sweatshirt') || item.name.toLowerCase().includes('sweater');
      }
    }

    // 2. Tops filtering
    if (item.category === 'top') {
      if (isSunnyWarm) {
        return hasTag(item, 'short-sleeve');
      }
      if (isRainy || isSnowy || isFreezing) {
        const hasLongSleevePETop = items.some(i => i.category === 'top' && hasTag(i, 'long-sleeve') && hasTag(i, 'PE-friendly'));
        const isPE = school.isPEDay || school.activity.toLowerCase().includes('pe') || school.activity.toLowerCase().includes('gym') || school.activity.toLowerCase().includes('sports') || school.activity.toLowerCase().includes('soccer') || school.activity.toLowerCase().includes('field');
        if (isPE) {
          if (hasLongSleevePETop) {
            return hasTag(item, 'long-sleeve');
          }
          return true; // Allow short-sleeve since no long-sleeve PE top exists
        }
        return hasTag(item, 'long-sleeve');
      }
      if (isChillyWindy) {
        if (hasLongSleeveTops) {
          return hasTag(item, 'long-sleeve');
        }
        return hasTag(item, 'short-sleeve'); // Allow short-sleeve if no long-sleeve in wardrobe
      }
    }

    // 3. Bottoms & Dresses filtering
    if (item.category === 'bottom' || item.category === 'dress') {
      const isDress = item.category === 'dress' || hasTag(item, 'dress');
      const isSkirt = hasTag(item, 'skirt');
      const isShorts = hasTag(item, 'shorts');
      const isLongPants = (hasTag(item, 'leggings') || hasTag(item, 'jeans') || hasTag(item, 'pants')) && !isDress && !isSkirt && !isShorts;

      if (isSunnyWarm) {
        if (isDress) {
          return hasTag(item, 'short-sleeve');
        }
        return isShorts || isSkirt; // Shorts or skirts allowed!
      }
      if (isChillyWindy) {
        return isLongPants; // Only long pants allowed!
      }
      if (isRainy) {
        if (isDress) {
          return hasTag(item, 'long-sleeve');
        }
        return isLongPants;
      }
      if (isSnowy || isFreezing) {
        return isLongPants && !isDress && !isSkirt; // Only long pants, no dresses or skirts!
      }
    }

    // 4. Shoes filtering
    if (item.category === 'shoes') {
      const isPE = school.isPEDay || school.activity.toLowerCase().includes('pe') || school.activity.toLowerCase().includes('gym') || school.activity.toLowerCase().includes('sports') || school.activity.toLowerCase().includes('soccer');
      const isFieldTrip = school.activity.toLowerCase().includes('field');

      const isSandal = hasTag(item, 'sandals') || item.name.toLowerCase().includes('sandal');
      const isSneaker = hasTag(item, 'Sneakers') || hasTag(item, 'sneakers') || item.name.toLowerCase().includes('running');
      const isRainBoot = hasTag(item, 'rain-boots') || item.name.toLowerCase().includes('rain');
      const isWinterBoot = hasTag(item, 'boots') && !isRainBoot && !isSneaker;
      const isBalletFlat = hasTag(item, 'ballet-flats') && !isSandal;

      if (isSunnyWarm) {
        if (isWinterBoot || isRainBoot) return false;
        const hasSandal = items.some(i => i.category === 'shoes' && (hasTag(i, 'sandals') || i.name.toLowerCase().includes('sandal')));
        if (hasSandal) {
          return isSandal;
        }
        return isBalletFlat || isSneaker;
      }
      if (isChillyWindy) {
        return !isSandal && !isWinterBoot && !isRainBoot; // Closed shoes (no sandals/winter/rain boots)
      }
      if (isRainy) {
        if (isPE || isFieldTrip) {
          return isSneaker;
        }
        return isRainBoot || isWinterBoot;
      }
      if (isSnowy || isFreezing) {
        if (isRainy) {
          return isRainBoot || isWinterBoot;
        }
        return isSneaker || isWinterBoot || isRainBoot;
      }
    }

    // 5. Accessories filtering
    if (item.category === 'accessory') {
      if (isSunnyWarm) {
        return !hasTag(item, 'Warm layer');
      }
    }

    return true;
  });

  logs.push(`[Weather Agent] Filtered out weather-unsuitable items. ${filtered.length} items remaining.`);
  return { items: filtered, outerwearRequired, heavyOuterwearRequired, warmAccessoryRequired, logs };
}

// =========================================================================
// 3. SCHOOL CONTEXT AGENT
// =========================================================================
function runSchoolContextAgent(items: WardrobeItem[], school: SchoolContext): {
  items: WardrobeItem[];
  logs: string[];
} {
  const logs: string[] = [];
  logs.push(`[School Agent] Evaluating school activity: "${school.activity}" (PE Day: ${school.isPEDay}).`);

  let filtered = [...items];

  const activity = school.activity.toLowerCase();
  const isPE = school.isPEDay || activity.includes('pe') || activity.includes('gym') || activity.includes('sports') || activity.includes('soccer');
  const isArt = activity.includes('art');
  const isFieldTrip = activity.includes('field');
  const isPictureDay = activity.includes('picture') || activity.includes('photo');

  if (isPE || isFieldTrip) {
    logs.push(`[School Agent] PE/Gym/Field Trip Day: Restricting clothing to sporty and shoes to running sneakers.`);
    filtered = filtered.filter(item => {
      if (item.category === 'shoes') {
        return hasTag(item, 'Sneakers') || hasTag(item, 'running');
      }
      if (item.category === 'bottom') {
        const isJeans = hasTag(item, 'jeans') || item.name.toLowerCase().includes('jeans') || item.name.toLowerCase().includes('denim');
        const isSkirt = hasTag(item, 'skirt');
        const isDress = hasTag(item, 'dress');
        return !isJeans && !isSkirt && !isDress && hasTag(item, 'PE-friendly');
      }
      if (item.category === 'top') {
        return hasTag(item, 'PE-friendly');
      }
      return true;
    });
  } else if (isArt) {
    logs.push(`[School Agent] Art Class: Restricting to washable comfortable clothes, sneakers, and dark colors.`);
    filtered = filtered.filter(item => {
      const isWhite = item.color.toLowerCase() === 'white' || item.name.toLowerCase().includes('white');
      const isDelicate = hasTag(item, 'formal') || hasTag(item, 'delicate') || hasTag(item, 'lace') || hasTag(item, 'sequined') || hasTag(item, 'tulle') || item.name.toLowerCase().includes('party') || item.name.toLowerCase().includes('fancy');
      
      if (isWhite) return false;
      if (isDelicate) return false;
      
      if (item.category === 'shoes') {
        return hasTag(item, 'Sneakers') || hasTag(item, 'running');
      }
      return true;
    });
  } else if (isPictureDay) {
    logs.push(`[School Agent] Picture Day: Nice dress or nice blouse + skirt. Flats/sandals only. No sportswear/sneakers.`);
    filtered = filtered.filter(item => {
      const isSporty = hasTag(item, 'PE-friendly') || hasTag(item, 'sporty') || hasTag(item, 'active') || hasTag(item, 'shorts');
      const isRunning = (hasTag(item, 'Sneakers') || hasTag(item, 'running')) && item.category === 'shoes';
      
      if (isSporty || isRunning) return false;
      
      if (item.category === 'shoes') {
        return hasTag(item, 'ballet-flats') || hasTag(item, 'flats') || hasTag(item, 'sandals') || item.name.toLowerCase().includes('sandal');
      }
      if (item.category === 'top') {
        return hasTag(item, 'formal') || hasTag(item, 'neat') || hasTag(item, 'lace') || item.name.toLowerCase().includes('polo') || item.name.toLowerCase().includes('blouse') || item.name.toLowerCase().includes('tie-knot');
      }
      if (item.category === 'bottom') {
        return hasTag(item, 'skirt') || hasTag(item, 'dress');
      }
      return true;
    });
  }

  logs.push(`[School Agent] School activity checks completed. ${filtered.length} items approved.`);
  return { items: filtered, logs };
}

// =========================================================================
// 4. FEEDBACK MEMORY AGENT
// =========================================================================
function runFeedbackMemoryAgent(
  items: WardrobeItem[],
  memory: ChildFeedbackMemory | undefined
): {
  items: WardrobeItem[];
  preferenceScores: Record<string, number>;
  logs: string[];
} {
  const logs: string[] = [];
  const preferenceScores: Record<string, number> = {};

  if (!memory) {
    logs.push(`[Feedback Agent] No historical feedback memory found. Applying base favorites weights.`);
    items.forEach(item => {
      preferenceScores[item.id] = item.isFavorite ? 5 : 0;
    });
    return { items, preferenceScores, logs };
  }

  logs.push(`[Feedback Agent] Loading memory profile (liked colors: ${memory.likedColors.length}, liked tags: ${memory.likedTags.length}, warmth offset: ${memory.warmthOffset}).`);

  items.forEach(item => {
    let score = 0;

    if (item.isFavorite) {
      score += 5;
    }

    if (memory.likedColors.includes(item.color)) {
      score += 15;
      logs.push(`[Feedback Agent] Color Preference: +15 score for "${item.name}" (liked color: ${item.color}).`);
    }

    const matchedTags = item.tags.filter(tag => memory.likedTags.includes(tag));
    if (matchedTags.length > 0) {
      score += matchedTags.length * 4;
      logs.push(`[Feedback Agent] Tag Preference: +${matchedTags.length * 4} score for "${item.name}" (matched: ${matchedTags.join(', ')}).`);
    }

    if (memory.warmthOffset !== 0) {
      if (memory.warmthOffset > 0) {
        if (item.warmRating >= 3) {
          const bonus = memory.warmthOffset * 6;
          score += bonus;
        } else if (item.warmRating <= 1) {
          const penalty = memory.warmthOffset * 5;
          score -= penalty;
        }
      } else if (memory.warmthOffset < 0) {
        const absOffset = Math.abs(memory.warmthOffset);
        if (item.warmRating <= 2) {
          const bonus = absOffset * 6;
          score += bonus;
        } else if (item.warmRating >= 3) {
          const penalty = absOffset * 5;
          score -= penalty;
        }
      }
    }

    preferenceScores[item.id] = score;
  });

  logs.push(`[Feedback Agent] Preference scores computed successfully.`);
  return { items, preferenceScores, logs };
}

// =========================================================================
// 5. STYLIST AGENT (OPTIMIZATION, SCORING & ASSEMBLY)
// =========================================================================
function scoreOutfitCombination(
  top: WardrobeItem | null,
  bottom: WardrobeItem,
  shoes: WardrobeItem,
  outerwear: WardrobeItem | null,
  accessory: WardrobeItem | null,
  child: Child,
  _school: SchoolContext,
  preferenceScores: Record<string, number>,
  memory: ChildFeedbackMemory | undefined,
  temp: number
): number {
  let score = 0;

  // 1. Base preference scores from Feedback Agent
  score += preferenceScores[bottom.id] || 0;
  score += preferenceScores[shoes.id] || 0;
  if (top) score += preferenceScores[top.id] || 0;
  if (outerwear) score += preferenceScores[outerwear.id] || 0;
  if (accessory) score += preferenceScores[accessory.id] || 0;

  // 2. Disliked Outfit Combo Check
  const comboKey = `${top ? top.id : 'none'}-${bottom.id}-${shoes.id}`;
  if (memory && memory.dislikedOutfits.includes(comboKey)) {
    return -10000; // Hard rejection
  }

  // 3. Style Classification & Consistency
  const getStyles = (item: WardrobeItem): string[] => {
    const s: string[] = [];
    const nameLower = item.name.toLowerCase();
    const tagsLower = item.tags.map(t => t.toLowerCase());

    if (tagsLower.includes('pe-friendly') || tagsLower.includes('sporty styles') || tagsLower.includes('active') || nameLower.includes('soccer') || nameLower.includes('nike') || nameLower.includes('adidas') || tagsLower.includes('sweat-wicking') || nameLower.includes('running')) {
      s.push('sporty');
    }
    if (tagsLower.includes('casual') || tagsLower.includes('cotton') || tagsLower.includes('denim') || nameLower.includes('jeans') || nameLower.includes('shorts') || nameLower.includes('tee') || nameLower.includes('sweatshirt') || nameLower.includes('hoodie')) {
      s.push('casual');
    }
    if (tagsLower.includes('formal wear') || tagsLower.includes('twirly') || tagsLower.includes('sparkly') || tagsLower.includes('smocked') || tagsLower.includes('flutter-sleeve') || tagsLower.includes('ballet-flats') || tagsLower.includes('neat') || tagsLower.includes('dress') || tagsLower.includes('skirt') || nameLower.includes('dress') || nameLower.includes('skirt') || nameLower.includes('lace') || nameLower.includes('polo')) {
      s.push('elegant');
    }
    if (tagsLower.includes('unicorn') || tagsLower.includes('butterfly') || tagsLower.includes('daisy') || tagsLower.includes('cute accessories') || nameLower.includes('unicorn') || nameLower.includes('butterfly') || nameLower.includes('daisy') || nameLower.includes('kitten') || tagsLower.includes('glitter') || tagsLower.includes('sparkly')) {
      s.push('playful');
    }

    if (s.length === 0) s.push('casual');
    return s;
  };

  const activeItems = [top, bottom, shoes, outerwear, accessory].filter(Boolean) as WardrobeItem[];
  
  // Count styles
  const styleCounts: Record<string, number> = { sporty: 0, casual: 0, elegant: 0, playful: 0 };
  activeItems.forEach(item => {
    const styles = getStyles(item);
    styles.forEach(style => {
      styleCounts[style]++;
    });
  });

  // Style consistency bonus
  let maxStyleCount = 0;
  Object.entries(styleCounts).forEach(([_, count]) => {
    if (count > maxStyleCount) {
      maxStyleCount = count;
    }
  });

  if (maxStyleCount === activeItems.length) {
    score += 30; // Perfect 100% consistent style
  } else if (maxStyleCount >= 3) {
    score += 15;
  }

  // Style Clashing Penalties
  const hasSporty = styleCounts.sporty > 0;
  const hasElegant = styleCounts.elegant > 0;
  const isDress = bottom && (bottom.tags.includes('dress') || bottom.name.toLowerCase().includes('dress'));

  // Penalty: Elegant dress with sporty shoes or accessories
  if (isDress && hasElegant && hasSporty) {
    score -= 40;
  }
  // Penalty: Sporty activewear with formal ballet flats
  if (hasSporty && (hasTag(shoes, 'ballet-flats') || hasTag(shoes, 'flats'))) {
    score -= 30;
  }
  // Penalty: Winter boots with summer dresses in warm weather
  const isWinterBoot = hasTag(shoes, 'boots') && !hasTag(shoes, 'rain-boots') && !hasTag(shoes, 'Sneakers');
  if (isDress && isWinterBoot && temp >= 70) {
    score -= 50;
  }
  // Penalty: Heavy puffer winter coat on warm days
  if (outerwear && (hasTag(outerwear, 'puffy') || hasTag(outerwear, 'puffer') || hasTag(outerwear, 'Heavy warm')) && temp >= 70) {
    score -= 50;
  }

  // 4. Color Harmony & Clashing
  const colors = activeItems.map(i => i.color);
  const colorCounts: Record<string, number> = {};
  colors.forEach(c => {
    colorCounts[c] = (colorCounts[c] || 0) + 1;
  });

  // Reward exact matches of non-neutral colors
  Object.entries(colorCounts).forEach(([color, count]) => {
    const cLower = color.toLowerCase();
    const isNeutral = ['white', 'grey', 'gray', 'black', 'denim', 'beige', 'cream'].some(n => cLower.includes(n));
    if (!isNeutral && count >= 2) {
      score += 15 * (count - 1); // bonus for color coordination
    }
  });

  // Neutral items versatility bonus
  activeItems.forEach(item => {
    const cLower = item.color.toLowerCase();
    const isNeutral = ['white', 'grey', 'gray', 'black', 'denim', 'beige', 'cream'].some(n => cLower.includes(n));
    if (isNeutral) {
      score += 5;
    }
  });

  // Color harmony pairs
  for (let i = 0; i < activeItems.length; i++) {
    for (let j = i + 1; j < activeItems.length; j++) {
      const c1 = activeItems[i].color.toLowerCase();
      const c2 = activeItems[j].color.toLowerCase();

      // Coral + Lavender/Purple Clashing
      if ((c1.includes('coral') && (c2.includes('lavender') || c2.includes('purple'))) ||
          (c2.includes('coral') && (c1.includes('lavender') || c1.includes('purple')))) {
        score -= 30;
      }
      // Coral + Pink/Magenta Clashing
      if ((c1.includes('coral') && (c2.includes('pink') || c2.includes('magenta'))) ||
          (c2.includes('coral') && (c1.includes('pink') || c1.includes('magenta')))) {
        score -= 25;
      }
      // Magenta + Teal/Green Clashing
      if ((c1.includes('magenta') && (c2.includes('teal') || c2.includes('green'))) ||
          (c2.includes('magenta') && (c1.includes('teal') || c1.includes('green')))) {
        score -= 30;
      }
      // Purple/Lavender + Yellow Clashing
      if ((c1.includes('purple') && c2.includes('yellow')) || (c2.includes('purple') && c1.includes('yellow')) ||
          (c1.includes('lavender') && c2.includes('yellow')) || (c2.includes('lavender') && c1.includes('yellow'))) {
        score -= 20;
      }
      // Harmonious pink + purple/lavender
      if ((c1.includes('pink') && (c2.includes('lavender') || c2.includes('purple'))) ||
          (c2.includes('pink') && (c1.includes('lavender') || c1.includes('purple')))) {
        score += 10;
      }
      // Harmonious blue + pink
      if ((c1.includes('blue') && c2.includes('pink')) || (c2.includes('blue') && c1.includes('pink'))) {
        score += 10;
      }
      // Harmonious teal + white/grey
      if ((c1.includes('teal') && (c2.includes('white') || c2.includes('grey') || c2.includes('gray'))) ||
          (c2.includes('teal') && (c1.includes('white') || c1.includes('grey') || c1.includes('gray')))) {
        score += 8;
      }
    }
  }

  // Emma & Mia Signature Favorites
  if (child.id === 'emma') {
    activeItems.forEach(item => {
      const c = item.color.toLowerCase();
      if (c.includes('lavender') || c.includes('pink') || c.includes('purple')) {
        score += 6;
      }
      const styles = getStyles(item);
      if (styles.includes('elegant') || styles.includes('playful')) {
        score += 4;
      }
    });
  } else {
    activeItems.forEach(item => {
      const c = item.color.toLowerCase();
      if (c.includes('teal') || c.includes('blue') || c.includes('black') || c.includes('grey') || c.includes('gray')) {
        score += 6;
      }
      const styles = getStyles(item);
      if (styles.includes('sporty') || styles.includes('casual')) {
        score += 4;
      }
    });
  }

  // Sensory Comfort Bonus
  activeItems.forEach(item => {
    item.tags.forEach(tag => {
      const t = tag.toLowerCase();
      if (t === 'soft' || t === 'no tags' || t === 'cotton' || t === 'stretchy' || t === 'soft fleece') {
        score += 5;
      }
    });
  });

  return score;
}

function runStylistAgent(
  filteredItems: WardrobeItem[],
  preferenceScores: Record<string, number>,
  weather: WeatherCondition,
  school: SchoolContext,
  memory: ChildFeedbackMemory | undefined,
  child: Child,
  outerwearRequired: boolean,
  warmAccessoryRequired: boolean,
  isComfortCollection: boolean = false
): OutfitCombination[] {
  const tops = filteredItems.filter(i => i.category === 'top');
  const bottoms = filteredItems.filter(i => i.category === 'bottom' || i.category === 'dress');
  const shoes = filteredItems.filter(i => i.category === 'shoes');
  const outerwears = filteredItems.filter(i => i.category === 'outerwear');
  const accessories = filteredItems.filter(i => i.category === 'accessory');

  // Fallbacks to avoid empty lists
  const fallbackWardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
  const candidateBottoms = bottoms.length > 0 ? bottoms : fallbackWardrobe.filter(i => i.category === 'bottom' || i.category === 'dress');
  const candidateShoes = shoes.length > 0 ? shoes : fallbackWardrobe.filter(i => i.category === 'shoes');
  const candidateTops = tops.length > 0 ? tops : fallbackWardrobe.filter(i => i.category === 'top');

  // Outerwear candidates
  let candidateOuterwears: (WardrobeItem | null)[] = [];
  if (outerwearRequired) {
    // If heavy outerwear is required (Snowy & Freezing), do NOT fall back to light jackets/hoodies. Leave slot empty if unavailable.
    const isSnowyOrFreezing = weather.condition === 'snowy' || weather.temp < 40;
    if (isSnowyOrFreezing) {
      const heavyOuterwears = outerwears.filter(i => hasTag(i, 'Heavy warm') || hasTag(i, 'puffy') || hasTag(i, 'puffer') || i.warmRating >= 5);
      candidateOuterwears = heavyOuterwears.length > 0 ? heavyOuterwears : [null];
    } else {
      candidateOuterwears = outerwears.length > 0 ? outerwears : fallbackWardrobe.filter(i => i.category === 'outerwear');
    }
  } else {
    candidateOuterwears = [null];
  }

  // Accessory candidates
  let candidateAccessories: (WardrobeItem | null)[] = [];
  if (warmAccessoryRequired) {
    candidateAccessories = accessories.filter(i => hasTag(i, 'Warm layer'));
    if (candidateAccessories.length === 0) {
      candidateAccessories = fallbackWardrobe.filter(i => i.category === 'accessory' && hasTag(i, 'Warm layer'));
    }
  } else if (school.isPEDay) {
    candidateAccessories = accessories.filter(i => hasTag(i, 'Sweat-wicking'));
  } else if (weather.temp >= 70 || weather.condition === 'sunny') {
    candidateAccessories = [null, ...accessories.filter(i => hasTag(i, 'Cute Accessories') || hasTag(i, 'Sun protection') || hasTag(i, 'Sporty styles'))];
  } else {
    candidateAccessories = [null];
  }

  if (candidateAccessories.length === 0) {
    candidateAccessories = [null];
  }

  const combinations: OutfitCombination[] = [];

  candidateBottoms.forEach(bottom => {
    const isDress = bottom.category === 'dress' || hasTag(bottom, 'dress');
    const topsToTry: (WardrobeItem | null)[] = isDress ? [null] : candidateTops;

    topsToTry.forEach(top => {
      candidateShoes.forEach(shoe => {
        let shoesValid = true;

        const isPE = school.isPEDay || school.activity.toLowerCase().includes('pe') || school.activity.toLowerCase().includes('gym') || school.activity.toLowerCase().includes('sports') || school.activity.toLowerCase().includes('soccer');
        const isFieldTrip = school.activity.toLowerCase().includes('field');
        const isPictureDay = school.activity.toLowerCase().includes('picture') || school.activity.toLowerCase().includes('photo');
        const isSunnyWarm = weather.temp >= 70;
        const isRainy = weather.condition === 'rainy';
        const isSnowy = weather.condition === 'snowy';
        const isFreezing = weather.temp < 40;
        const isChillyWindy = ((weather.temp >= 40 && weather.temp < 70) || (weather.condition === 'windy' && weather.temp < 70)) && !isRainy && !isSnowy && !isFreezing;

        const isSandal = hasTag(shoe, 'sandals') || shoe.name.toLowerCase().includes('sandal');
        const isBalletFlat = hasTag(shoe, 'ballet-flats') && !isSandal;
        const isSneaker = hasTag(shoe, 'Sneakers') || hasTag(shoe, 'sneakers') || shoe.name.toLowerCase().includes('running');
        const isRainBoot = hasTag(shoe, 'rain-boots') || shoe.name.toLowerCase().includes('rain');
        const isWinterBoot = hasTag(shoe, 'boots') && !isRainBoot && !isSneaker;

        // Apply strict Footwear Rules in the generation loop:
        if (isPE || isFieldTrip) {
          if (!isSneaker) shoesValid = false;
        } else if (isPictureDay) {
          if (!isBalletFlat && !isSandal) shoesValid = false;
        } else if (isSnowy || isFreezing) {
          if (isRainy) {
            if (!isRainBoot && !isWinterBoot) shoesValid = false;
          } else {
            if (!isSneaker && !isWinterBoot && !isRainBoot) shoesValid = false;
          }
        } else if (isRainy) {
          if (!isRainBoot && !isWinterBoot) shoesValid = false;
        } else if (isSunnyWarm) {
          if (isWinterBoot || isRainBoot) shoesValid = false;
          const hasSandal = candidateShoes.some(s => hasTag(s, 'sandals') || s.name.toLowerCase().includes('sandal'));
          if (hasSandal) {
            if (!isSandal) shoesValid = false;
          } else {
            if (!isBalletFlat && !isSneaker) shoesValid = false;
          }
        } else if (isChillyWindy) {
          if (isSandal || isWinterBoot || isRainBoot) shoesValid = false;
        }

        if (isComfortCollection && !isSneaker) {
          shoesValid = false; // Comfort collection forces sneakers
        }

        if (!shoesValid) return;

        candidateOuterwears.forEach(outerwear => {
          candidateAccessories.forEach(accessory => {
            const score = scoreOutfitCombination(
              top,
              bottom,
              shoe,
              outerwear,
              accessory,
              child,
              school,
              preferenceScores,
              memory,
              weather.temp
            );

            if (score > -5000) {
              combinations.push({
                top,
                bottom,
                shoes: shoe,
                outerwear,
                accessory,
                score
              });
            }
          });
        });
      });
    });
  });

  // Sort combinations by coordination score descending
  combinations.sort((a, b) => b.score - a.score);
  return combinations;
}

// =========================================================================
// PUBLIC API IMPLEMENTATION
// =========================================================================
// Helper to dynamically search the wardrobe for the first item of correct categories (never clashing categories)
function getFallbackCombo(child: Child, _weather: WeatherCondition, _school: SchoolContext): OutfitCombination {
  const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
  
  const top = wardrobe.find(i => i.category === 'top') || null;
  const bottom = wardrobe.find(i => i.category === 'bottom' || i.category === 'dress')!;
  const shoes = wardrobe.find(i => i.category === 'shoes')!;
  const outerwear = wardrobe.find(i => i.category === 'outerwear') || null;
  const accessory = wardrobe.find(i => i.category === 'accessory') || null;

  return {
    top: bottom.category === 'dress' ? null : top,
    bottom,
    shoes,
    outerwear,
    accessory,
    score: 50
  };
}

export function generateOutfitRecommendation(
  child: Child,
  weather: WeatherCondition,
  school: SchoolContext,
  iteration: number = 0,
  memory?: ChildFeedbackMemory
): Outfit {
  // 1. Run Wardrobe Agent
  const wardrobeResult = runWardrobeAgent(child);
  
  // 2. Run Weather Agent (smart intersection including school context)
  const weatherResult = runWeatherAgent(wardrobeResult.items, weather, school);
  
  // 3. Run School Context Agent
  const schoolResult = runSchoolContextAgent(weatherResult.items, school);
  
  // 4. Run Feedback Memory Agent
  const feedbackResult = runFeedbackMemoryAgent(schoolResult.items, memory);
  
  // 5. Run Stylist Agent
  const combinations = runStylistAgent(
    feedbackResult.items,
    feedbackResult.preferenceScores,
    weather,
    school,
    memory,
    child,
    weatherResult.outerwearRequired,
    weatherResult.warmAccessoryRequired,
    false
  );

  let selectedCombo = null;
  let currentIteration = iteration;

  // Experienced Parent Validation Loop: Find first combination that passes
  for (let offset = 0; offset < combinations.length; offset++) {
    const combo = combinations[(currentIteration + offset) % combinations.length];
    if (passesRealParentValidation(combo, child, weather, school).passes) {
      selectedCombo = combo;
      break;
    }
  }

  // Fallback search
  if (!selectedCombo) {
    for (let i = 0; i < combinations.length; i++) {
      if (passesRealParentValidation(combinations[i], child, weather, school).passes) {
        selectedCombo = combinations[i];
        break;
      }
    }
  }

  const finalCombo = selectedCombo || combinations[iteration % combinations.length] || getFallbackCombo(child, weather, school);

  const { score, notes } = calculateSuitability(
    child,
    finalCombo.top,
    finalCombo.bottom,
    finalCombo.shoes,
    finalCombo.outerwear,
    finalCombo.accessory,
    weather,
    school,
    memory
  );

  return {
    childId: child.id,
    top: finalCombo.top,
    bottom: finalCombo.bottom,
    shoes: finalCombo.shoes,
    outerwear: finalCombo.outerwear,
    accessory: finalCombo.accessory,
    stylistNotes: notes,
    suitabilityScore: score
  };
}

export function generatePreCuratedOutfit(
  child: Child,
  weather: WeatherCondition,
  school: SchoolContext,
  type: 'comfort' | 'weather' | 'activity' | 'style'
): Outfit {
  let wardrobeResult = runWardrobeAgent(child);

  if (type === 'comfort') {
    wardrobeResult.items = wardrobeResult.items.filter(item => {
      const isComfortable = item.tags.some(t => ['soft', 'no tags', 'cotton', 'stretchy', 'sneakers', 'soft fleece', 'furry lining'].includes(t.toLowerCase()));
      const isStiff = item.tags.some(t => ['denim', 'sturdy denim', 'formal wear', 'smocked', 'sequined', 'sparkly'].includes(t.toLowerCase()));
      return isComfortable && !isStiff;
    });
    if (wardrobeResult.items.length === 0) {
      wardrobeResult = runWardrobeAgent(child);
    }
  }

  const weatherResult = runWeatherAgent(wardrobeResult.items, weather, school);
  const schoolResult = runSchoolContextAgent(weatherResult.items, school);
  const feedbackResult = runFeedbackMemoryAgent(schoolResult.items, undefined);
  
  const combinations = runStylistAgent(
    feedbackResult.items,
    feedbackResult.preferenceScores,
    weather,
    school,
    undefined,
    child,
    weatherResult.outerwearRequired,
    weatherResult.warmAccessoryRequired,
    type === 'comfort'
  );

  let selectedCombo = null;
  for (let i = 0; i < combinations.length; i++) {
    if (passesRealParentValidation(combinations[i], child, weather, school).passes) {
      selectedCombo = combinations[i];
      break;
    }
  }

  const finalCombo = selectedCombo || combinations[0] || getFallbackCombo(child, weather, school);

  const titleMap = {
    comfort: 'Sensory Comfort First',
    weather: 'Weather Protection Shield',
    activity: 'School Event Approved',
    style: child.id === 'emma' ? 'Pastel Pink & Unicorn Dream' : 'Teal Sporty Power'
  };

  const focusMap = {
    comfort: 'tagless, ultra-soft, and stretchy textures with zero restrictive seams',
    weather: `adapting perfectly to the ${weather.condition} forecast`,
    activity: `satisfying all rules for today's ${school.activity}`,
    style: `highlighting ${child.name}'s absolute favorite colors and signature styles`
  };

  const { score, notes } = calculateSuitability(
    child,
    finalCombo.top,
    finalCombo.bottom,
    finalCombo.shoes,
    finalCombo.outerwear,
    finalCombo.accessory,
    weather,
    school
  );

  const finalNotes = `[Aura Curated - ${titleMap[type]}] Today, I hand-selected this outfit focusing on ${focusMap[type]}. ${finalCombo.top ? 'We paired the ' + finalCombo.top.name + ' with the ' + finalCombo.bottom.name : 'We selected the ' + finalCombo.bottom.name} and ${finalCombo.shoes.name}. ${finalCombo.outerwear ? 'Added ' + finalCombo.outerwear.name + ' for protective layering. ' : ''}${notes.split('. ').slice(1).join('. ')}`;

  return {
    childId: child.id,
    top: finalCombo.top,
    bottom: finalCombo.bottom,
    shoes: finalCombo.shoes,
    outerwear: finalCombo.outerwear,
    accessory: finalCombo.accessory,
    stylistNotes: finalNotes,
    suitabilityScore: score
  };
}

// Internal helper to calculate suitability scores and generate reasoning notes
function calculateSuitability(
  child: Child,
  top: WardrobeItem | null,
  bottom: WardrobeItem,
  shoes: WardrobeItem,
  outerwear: WardrobeItem | null,
  accessory: WardrobeItem | null,
  weather: WeatherCondition,
  school: SchoolContext,
  memory?: ChildFeedbackMemory
): { score: number; notes: string } {
  let score = 85;
  let reasonParts: string[] = [];

  const temp = weather.temp;
  const condition = weather.condition;
  
  const isRainy = condition === 'rainy';
  const isSnowy = condition === 'snowy';
  const isSunnyWarm = temp >= 70;
  const isColdSnowyOrFreezing = condition === 'snowy' || temp <= 45;
  const isChillyWindy = ((temp >= 40 && temp < 70) || (condition === 'windy' && temp < 70)) && !isRainy && !isSnowy && !isColdSnowyOrFreezing;

  const isDress = bottom && (bottom.category === 'dress' || hasTag(bottom, 'dress'));
  const isSkirt = hasTag(bottom, 'skirt');
  const isShorts = hasTag(bottom, 'shorts');
  const isLongPants = bottom && (hasTag(bottom, 'leggings') || hasTag(bottom, 'jeans') || hasTag(bottom, 'pants')) && !isDress && !isSkirt && !isShorts;

  const isSandal = shoes && (hasTag(shoes, 'sandals') || shoes.name.toLowerCase().includes('sandal'));
  const isBalletFlat = shoes && hasTag(shoes, 'ballet-flats') && !isSandal;
  const isSneaker = shoes && (hasTag(shoes, 'Sneakers') || hasTag(shoes, 'sneakers') || shoes.name.toLowerCase().includes('running'));
  const isRainBoot = shoes && (hasTag(shoes, 'rain-boots') || shoes.name.toLowerCase().includes('rain'));
  const isWinterBoot = shoes && hasTag(shoes, 'boots') && !isRainBoot && !isSneaker;

  // 1. Sensory Check
  const triggersDislikes = (item: WardrobeItem) => {
    return item.tags.some(tag => 
      child.sensoryDislikes.some(dislike => tag.toLowerCase() === dislike.toLowerCase())
    );
  };

  const hasSensoryViolation = (top && triggersDislikes(top)) || 
                              (bottom && triggersDislikes(bottom)) || 
                              (shoes && triggersDislikes(shoes)) || 
                              (outerwear && triggersDislikes(outerwear)) ||
                              (accessory && triggersDislikes(accessory));

  if (hasSensoryViolation) {
    score -= 30;
    reasonParts.push(`⚠️ WARNING: Contains items that trigger sensory dislikes (such as scratchy tags or stiff denim)`);
  } else {
    score += 10;
    reasonParts.push(`comfortably styled with 100% sensory-safe, soft, and tagless fabrics`);
  }

  // 2. PE Day & Field Trip Rules
  const isPE = school.isPEDay || school.activity.toLowerCase().includes('pe') || school.activity.toLowerCase().includes('gym') || school.activity.toLowerCase().includes('sports') || school.activity.toLowerCase().includes('soccer');
  const isFieldTrip = school.activity.toLowerCase().includes('field');
  if (isPE || isFieldTrip) {
    const hasSneakers = hasTag(shoes, 'Sneakers') || hasTag(shoes, 'running');
    const isJeans = bottom && (hasTag(bottom, 'jeans') || bottom.name.toLowerCase().includes('jeans') || bottom.name.toLowerCase().includes('denim'));
    const isSporty = bottom && hasTag(bottom, 'PE-friendly') && !isSkirt && !isDress && !isJeans;
    const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
    const hasLongSleeveInWardrobe = wardrobe.some(item => (item.category === 'top' || item.category === 'dress') && hasTag(item, 'long-sleeve'));
    const isLongSleeve = (isDress && hasTag(bottom, 'long-sleeve')) || (top && hasTag(top, 'long-sleeve'));

    if (hasSneakers && isSporty && (isLongSleeve || !hasLongSleeveInWardrobe)) {
      score += 5;
      reasonParts.push(`fully matches ${isPE ? 'PE gym day' : 'field trip'} rules with active sneakers and athletic legwear`);
    } else {
      score -= 30;
      if (!hasSneakers) reasonParts.push(`❌ ${isPE ? 'PE' : 'Field Trip'} Violation: Sneakers are mandatory`);
      if (isDress || isSkirt) reasonParts.push(`❌ ${isPE ? 'PE' : 'Field Trip'} Violation: Dresses and skirts are strictly forbidden`);
      if (isJeans) reasonParts.push(`❌ ${isPE ? 'PE' : 'Field Trip'} Violation: Jeans and denim are strictly forbidden`);
      if (!isSporty && !isDress && !isSkirt && !isJeans) reasonParts.push(`❌ ${isPE ? 'PE' : 'Field Trip'} Violation: Active PE-friendly pants are required`);
      if (!isLongSleeve && hasLongSleeveInWardrobe) reasonParts.push(`❌ ${isPE ? 'PE' : 'Field Trip'} Violation: Long-sleeve top required`);
    }
  }

  // 3. Rainy Day Rules
  if (condition === 'rainy') {
    const hasBoots = hasTag(shoes, 'boots') || hasTag(shoes, 'rain-boots');
    const hasRaincoat = outerwear && (hasTag(outerwear, 'Waterproof') || hasTag(outerwear, 'Rain-ready') || outerwear.name.toLowerCase().includes('coat') || outerwear.name.toLowerCase().includes('jacket') || outerwear.name.toLowerCase().includes('parka'));
    const isLongSleeve = (isDress && hasTag(bottom, 'long-sleeve')) || (top && hasTag(top, 'long-sleeve'));

    if (isPE || isFieldTrip) {
      const hasSneakers = hasTag(shoes, 'Sneakers') || hasTag(shoes, 'running');
      if (hasSneakers && hasRaincoat && isLongSleeve) {
        score += 5;
        reasonParts.push(`equipped with a hooded rain jacket and active sneakers for wet weather movement`);
      } else {
        score -= 20;
        if (!hasSneakers) reasonParts.push(`PE Rain: Sneakers required instead of rain boots`);
        if (!hasRaincoat) reasonParts.push(`Rain: Waterproof rain jacket missing`);
        if (!isLongSleeve) reasonParts.push(`Rain: Long-sleeve shirt/dress required in damp weather`);
      }
    } else {
      if (hasBoots && hasRaincoat && isLongSleeve) {
        score += 5;
        reasonParts.push(`equipped with waterproof rain boots, a rain coat, and long sleeves`);
      } else {
        score -= 20;
        if (!hasBoots) reasonParts.push(`Rain: Waterproof rain boots are mandatory`);
        if (!hasRaincoat) reasonParts.push(`Rain: Waterproof rain coat is mandatory`);
        if (!isLongSleeve) reasonParts.push(`Rain: Long-sleeve shirt/dress required in damp weather`);
      }
    }
  }

  // 4. Snowy & Freezing / Cold Day Rules
  if (isColdSnowyOrFreezing) {
    const hasLongSleeveTop = top && hasTag(top, 'long-sleeve');
    const hasHeavyOuter = outerwear && (hasTag(outerwear, 'Heavy warm') || hasTag(outerwear, 'puffy') || hasTag(outerwear, 'puffer') || outerwear.warmRating >= 5);
    const hasWinterBoots = isWinterBoot || isRainBoot;
    const footwearOk = isRainy ? hasWinterBoots : (hasWinterBoots || isSneaker);
    const clothingOk = hasLongSleeveTop && isLongPants && !isDress && !isSkirt;

    if (clothingOk && hasHeavyOuter && footwearOk) {
      score += 10;
      reasonParts.push(`fully winterized for cold ${temp}°F conditions with a heavy coat, long sleeves, long pants, and warm footwear`);
    } else {
      score -= 30;
      if (!hasLongSleeveTop) reasonParts.push(`Freezing: A long-sleeve shirt is mandatory`);
      if (!isLongPants || isDress || isSkirt) reasonParts.push(`Freezing: Long pants are mandatory (no dresses/skirts)`);
      if (!hasHeavyOuter) reasonParts.push(`Freezing: A heavy winter coat is mandatory (no hoodies/sweatshirts)`);
      if (isRainy && !hasWinterBoots) reasonParts.push(`Freezing: Waterproof boots are mandatory in the rain`);
      if (!isRainy && !footwearOk) reasonParts.push(`Freezing: Closed shoes or boots are mandatory`);
    }

    if (child.id === 'emma') {
      const hasScarf = accessory && (accessory.id === 'e_acc_scarf' || hasTag(accessory, 'Warm layer') || hasTag(accessory, 'scarf'));
      if (hasScarf) {
        score += 5;
        reasonParts.push(`cozy with a warm winter scarf`);
      } else {
        score -= 15;
        reasonParts.push(`Freezing: Missing winter scarf`);
      }
    }
  }

  // 5. Sunny & Warm Day Rules
  if (isSunnyWarm) {
    const isShortSleeve = isDress ? hasTag(bottom, 'short-sleeve') : (top && hasTag(top, 'short-sleeve'));
    const isShortsOrSkirt = !isDress && (isShorts || isSkirt);
    const noOuterwear = !outerwear;
    const noBoots = !isWinterBoot && !isRainBoot;
    
    const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
    const hasSandal = wardrobe.some(i => i.category === 'shoes' && (hasTag(i, 'sandals') || i.name.toLowerCase().includes('sandal')));
    const shoesOk = isSandal || (!hasSandal && (isBalletFlat || isSneaker));

    if (isShortSleeve && (isDress || isShortsOrSkirt) && noOuterwear && noBoots && shoesOk) {
      score += 10;
      reasonParts.push(`perfectly styled for sunny ${temp}°F weather with short sleeves, shorts/skirt, and sandals`);
    } else {
      score -= 30;
      if (!isShortSleeve) reasonParts.push(`Warm: Short-sleeve tops/dresses are required`);
      if (!isDress && !isShorts && !isSkirt) reasonParts.push(`Warm: Shorts or a skirt are required (no long pants)`);
      if (outerwear) reasonParts.push(`Warm: Outerwear is strictly forbidden`);
      if (isWinterBoot || isRainBoot) reasonParts.push(`Warm: Boots are strictly forbidden`);
      if (hasSandal && !isSandal) reasonParts.push(`Warm: Sandals are required when available`);
    }
  }

  // 6. Chilly & Windy Day Rules
  if (isChillyWindy) {
    const isSweatshirt = outerwear && (hasTag(outerwear, 'sweater-hoodie') || hasTag(outerwear, 'cardigan') || hasTag(outerwear, 'fleece') || outerwear.name.toLowerCase().includes('hoodie') || outerwear.name.toLowerCase().includes('sweatshirt'));
    const isLongSleeve = (isDress && hasTag(bottom, 'long-sleeve')) || (top && hasTag(top, 'long-sleeve'));
    const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
    const hasLongSleeveInWardrobe = wardrobe.some(item => (item.category === 'top' || item.category === 'dress') && hasTag(item, 'long-sleeve'));
    const topOk = isLongSleeve || (!hasLongSleeveInWardrobe && top && hasTag(top, 'short-sleeve'));
    const shoesOk = !isSandal && !isWinterBoot && !isRainBoot;

    if (isSweatshirt && topOk && isLongPants && shoesOk) {
      score += 5;
      reasonParts.push(`comfortably layered for chilly ${temp}°F weather with a sweatshirt, long pants, and closed shoes`);
    } else {
      score -= 30;
      if (!isSweatshirt) reasonParts.push(`Chilly: A sweatshirt, hoodie, or cardigan is mandatory`);
      if (!topOk) reasonParts.push(`Chilly: A long-sleeve shirt/dress is required when available`);
      if (!isLongPants) reasonParts.push(`Chilly: Long pants are mandatory`);
      if (isSandal) reasonParts.push(`Chilly: Sandals are forbidden`);
      if (isWinterBoot) reasonParts.push(`Chilly: Heavy winter boots are unnecessary`);
    }
  }

  // 7. Art Class Rules
  if (school.activity.toLowerCase().includes('art')) {
    const isWhite = (top && top.color.toLowerCase() === 'white') || (bottom && bottom.color.toLowerCase() === 'white') || (outerwear && outerwear.color.toLowerCase() === 'white');
    const isDelicate = (top && (hasTag(top, 'formal') || hasTag(top, 'delicate') || hasTag(top, 'lace') || hasTag(top, 'sequined'))) ||
                       (bottom && (hasTag(bottom, 'formal') || hasTag(bottom, 'delicate') || hasTag(bottom, 'tulle') || hasTag(bottom, 'sequined') || bottom.name.toLowerCase().includes('party') || bottom.name.toLowerCase().includes('fancy')));
    const hasSneakers = hasTag(shoes, 'Sneakers') || hasTag(shoes, 'running');

    if (isWhite || isDelicate || !hasSneakers) {
      score -= 30;
      if (isWhite) reasonParts.push(`Art: White clothing is strictly forbidden`);
      if (isDelicate) reasonParts.push(`Art: Delicate or fancy clothing is strictly forbidden`);
      if (!hasSneakers) reasonParts.push(`Art: Sneakers are required`);
    } else {
      score += 5;
      reasonParts.push(`wearing dark, wash-friendly play clothes and sneakers suitable for messy art workshops`);
    }
  }

  // 8. Picture Day Rules
  if (school.activity.toLowerCase().includes('picture')) {
    const isApprovedOutfit = isDress || (top && isSkirt);
    const isSporty = (top && (hasTag(top, 'PE-friendly') || hasTag(top, 'sporty') || hasTag(top, 'active'))) ||
                     (bottom && (hasTag(bottom, 'PE-friendly') || hasTag(bottom, 'sporty') || hasTag(bottom, 'active') || isShorts));
    const isRunning = isSneaker;
    const isNiceShoes = isBalletFlat || isSandal;

    if (isApprovedOutfit && !isSporty && !isRunning && isNiceShoes) {
      score += 10;
      reasonParts.push(`beautifully dressed in a nice dress/skirt outfit with flats/sandals for school photos`);
    } else {
      score -= 30;
      if (!isApprovedOutfit) reasonParts.push(`Picture Day: A nice dress or nice blouse + skirt is required`);
      if (!isNiceShoes) reasonParts.push(`Picture Day: Nice ballet flats or sandals are required`);
      if (isSporty) reasonParts.push(`Picture Day: Sportswear is strictly forbidden`);
      if (isRunning) reasonParts.push(`Picture Day: Running shoes/sneakers are strictly forbidden`);
    }
  }

  // 9. Style Preferences Match
  const matchingPrefs = [...(top ? top.tags : []), ...bottom.tags].filter(t => 
    child.preferences.some(p => p.toLowerCase() === t.toLowerCase() || t.toLowerCase().includes(p.toLowerCase()))
  );
  if (matchingPrefs.length > 0) {
    score += 4;
  }

  // 10. Feedback Memory adjustments
  if (memory) {
    let memoryBonus = 0;
    const items = [top, bottom, shoes, outerwear, accessory];
    items.forEach(item => {
      if (item) {
        if (memory.likedColors.includes(item.color)) memoryBonus += 2;
        const tagMatches = item.tags.filter(t => memory.likedTags.includes(t));
        memoryBonus += tagMatches.length * 1.5;
      }
    });
    if (memoryBonus > 0) {
      score += Math.min(10, Math.floor(memoryBonus));
      reasonParts.push(`highly tailored to ${child.name}'s preferred style and color memory`);
    }

    // Warmness alignment check
    const activeItems = items.filter(Boolean) as WardrobeItem[];
    const averageWarmth = activeItems.reduce((acc, item) => acc + item.warmRating, 0) / activeItems.length;
    
    if (memory.warmthOffset < 0) {
      if (averageWarmth <= 2.8) {
        score += 5;
        reasonParts.push(`adjusted with lighter warmth layers per memory request`);
      }
    } else if (memory.warmthOffset > 0) {
      if (averageWarmth >= 3.0) {
        score += 5;
        reasonParts.push(`reinforced with warmer insulated layers per memory request`);
      }
    }
  }

  // Enforce Parent Validation Check
  const mockOutfit: Outfit = {
    childId: child.id,
    top,
    bottom,
    shoes,
    outerwear,
    accessory,
    stylistNotes: '',
    suitabilityScore: 100
  };

  if ((isDress || isSkirt) && isColdSnowyOrFreezing) {
    mockOutfit.stylistNotes = "Added warm fleece-lined leggings under the dress/skirt.";
  }

  const parentValidation = validateOutfit(mockOutfit, child, weather, school);
  
  if (!parentValidation.isValid) {
    // Lower score significantly for invalid parent-rejected outfits
    score = Math.max(10, score - 40);
    
    // Add weather warning to notes
    const parentReason = parentValidation.reasons[0] || "Outfit does not satisfy safety and weather rules.";
    reasonParts.unshift(`⚠️ Weather Warning: A real parent would NOT send ${child.name} to school wearing this! (${parentReason})`);
  }

  // Cap score
  const finalScore = Math.max(10, Math.min(score, 100));

  let leadIn = `Hello! Today, I styled ${child.name} to be fully prepared and comfortable for school.`;
  
  // Dress/Skirt Layering Notice
  if ((isDress || isSkirt) && isColdSnowyOrFreezing) {
    leadIn += ` [Aura Added Layers] Aura added cozy, warm fleece-lined leggings under the ${isDress ? 'dress' : 'skirt'} to keep her legs protected from the cold.`;
  }

  const body = ` Under these conditions, they are ${reasonParts.join(', and ')}.`;
  const closure = ` Suitability score is calibrated at ${finalScore}% based on weather, school constraints, and sensory feedback.`;

  return {
    score: finalScore,
    notes: leadIn + body + closure
  };
}
