import type { Child, WeatherCondition, SchoolContext, Outfit, ChildFeedbackMemory } from '../types';
import { emmaWardrobe, miaWardrobe } from './wardrobe';

export interface ValidationResult {
  isValid: boolean;
  severity: 'info' | 'warning' | 'critical';
  reasons: string[];
  recommendedAction: string;
  failedAgents: ('profile' | 'weather' | 'school' | 'feedback' | 'stylist')[];
}

// Helper to check if an item's tags or name match a query (case-insensitive)
const hasTag = (item: any, tagToFind: string): boolean => {
  if (!item) return false;
  const lowerFind = tagToFind.toLowerCase();
  return item.tags.some((t: string) => t.toLowerCase() === lowerFind || t.toLowerCase().includes(lowerFind)) ||
         item.name.toLowerCase().includes(lowerFind);
};

export function validateOutfit(
  outfit: Outfit,
  child: Child,
  weather: WeatherCondition,
  school: SchoolContext,
  feedbackMemory?: ChildFeedbackMemory
): ValidationResult {
  const reasons: string[] = [];
  const failedAgents: ('profile' | 'weather' | 'school' | 'feedback' | 'stylist')[] = [];
  
  const status = {
    severity: 'info' as 'info' | 'warning' | 'critical'
  };

  const updateSeverity = (level: 'info' | 'warning' | 'critical', agent: 'profile' | 'weather' | 'school' | 'feedback' | 'stylist') => {
    if (level === 'critical') {
      status.severity = 'critical';
    } else if (level === 'warning' && status.severity !== 'critical') {
      status.severity = 'warning';
    }
    if (!failedAgents.includes(agent)) {
      failedAgents.push(agent);
    }
  };

  const top = outfit.top;
  const bottom = outfit.bottom;
  const shoes = outfit.shoes;
  const outerwear = outfit.outerwear;
  const accessory = outfit.accessory;

  const temp = weather.temp;
  const condition = weather.condition;

  const isRainy = condition === 'rainy';
  const isSnowy = condition === 'snowy';
  const isFreezing = temp < 40;
  const isSunnyWarm = temp >= 70;
  const isChillyWindy = (temp >= 40 && temp < 70) || (condition === 'windy' && temp < 70);

  const isDress = bottom && (bottom.tags.includes('dress') || bottom.name.toLowerCase().includes('dress'));
  const isSkirt = bottom && (bottom.tags.includes('skirt') || bottom.name.toLowerCase().includes('skirt'));
  const isShorts = bottom && (bottom.tags.includes('shorts') || bottom.name.toLowerCase().includes('shorts'));
  const isLongPants = bottom && (hasTag(bottom, 'leggings') || hasTag(bottom, 'jeans') || hasTag(bottom, 'pants')) && !isDress && !isSkirt && !isShorts;

  const isPE = school.isPEDay || school.activity.toLowerCase().includes('pe') || school.activity.toLowerCase().includes('gym') || school.activity.toLowerCase().includes('sports') || school.activity.toLowerCase().includes('soccer');
  const isArt = school.activity.toLowerCase().includes('art');
  const isFieldTrip = school.activity.toLowerCase().includes('field');
  const isPictureDay = school.activity.toLowerCase().includes('picture') || school.activity.toLowerCase().includes('photo');

  // Shoe classifications
  const isSandal = shoes && (hasTag(shoes, 'sandals') || shoes.name.toLowerCase().includes('sandal'));
  const isBalletFlat = shoes && hasTag(shoes, 'ballet-flats') && !isSandal;
  const isSneaker = shoes && (hasTag(shoes, 'Sneakers') || hasTag(shoes, 'sneakers') || shoes.name.toLowerCase().includes('running'));
  const isRainBoot = shoes && (hasTag(shoes, 'rain-boots') || shoes.name.toLowerCase().includes('rain'));
  const isWinterBoot = shoes && hasTag(shoes, 'boots') && !isRainBoot && !isSneaker;

  // =========================================================================
  // 1. DRESS & STRUCTURE RULES (Mandatory)
  // =========================================================================
  const usesDress = bottom && (bottom.category === 'dress' || hasTag(bottom, 'dress'));

  if (usesDress) {
    if (top) {
      reasons.push('Dress Rule: A dress replaces a top and bottom. Do not pair with a top shirt.');
      updateSeverity('critical', 'stylist');
    }
    if (!shoes) {
      reasons.push('Dress Rule: An outfit using a dress must include shoes.');
      updateSeverity('critical', 'stylist');
    }
    // Add outerwear only if weather requires it
    const weatherRequiresOuterwear = isRainy || isSnowy || isFreezing || isChillyWindy;
    if (!weatherRequiresOuterwear && outerwear) {
      reasons.push('Dress Rule: Outerwear is not needed and should be omitted in warm weather.');
      updateSeverity('critical', 'weather');
    }
  } else {
    // Non-dress
    if (!top) {
      reasons.push('Structure Rule: An outfit without a dress must include a top shirt.');
      updateSeverity('critical', 'stylist');
    }
    if (!bottom) {
      reasons.push('Structure Rule: An outfit without a dress must include a bottom.');
      updateSeverity('critical', 'stylist');
    }
    if (!shoes) {
      reasons.push('Structure Rule: An outfit must include shoes.');
      updateSeverity('critical', 'stylist');
    }
  }

  if (!shoes) {
    reasons.push('Structure Rule: Shoes are mandatory for any school outfit.');
    updateSeverity('critical', 'stylist');
  }

  // =========================================================================
  // 2. WEATHER RULES (Mandatory)
  // =========================================================================

  // --- SUNNY & WARM (70°F+) ---
  if (isSunnyWarm) {
    // Preferred: Short-sleeve top + shorts/skirt OR short-sleeve dress
    if (usesDress) {
      if (!hasTag(bottom, 'short-sleeve')) {
        reasons.push('🌤️ Sunny & Warm: A short-sleeve dress is required in warm weather. Sleeveless or long-sleeve dresses are forbidden.');
        updateSeverity('critical', 'weather');
      }
    } else {
      if (top && !hasTag(top, 'short-sleeve')) {
        reasons.push('🌤️ Sunny & Warm: A short-sleeve top is required. Long-sleeve shirts are forbidden.');
        updateSeverity('critical', 'weather');
      }
      if (!isShorts && !isSkirt) {
        reasons.push('🌤️ Sunny & Warm: Short pants (shorts) or a skirt are required. Long pants and jeans are forbidden.');
        updateSeverity('critical', 'weather');
      }
    }

    // Outerwear: Strictly forbidden
    if (outerwear) {
      reasons.push('🌤️ Sunny & Warm: Outerwear (coats, sweatshirts, hoodies, cardigans, fleeces) is strictly forbidden in warm weather.');
      updateSeverity('critical', 'weather');
    }

    // Shoes: Open shoes (sandals/flip-flops) preferred; if none in wardrobe, ballet flats or sneakers. Boots are forbidden.
    if (isWinterBoot || isRainBoot) {
      reasons.push('🌤️ Sunny & Warm: Boots are strictly forbidden in warm weather.');
      updateSeverity('critical', 'weather');
    }

    const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
    const hasOpenShoe = wardrobe.some(item => item.category === 'shoes' && (hasTag(item, 'sandals') || item.name.toLowerCase().includes('sandal')));
    
    if (!isSandal) {
      if (hasOpenShoe) {
        reasons.push('🌤️ Sunny & Warm: Sandals or open shoes are required when available in the wardrobe.');
        updateSeverity('critical', 'weather');
      } else if (!isBalletFlat && !isSneaker) {
        reasons.push('🌤️ Sunny & Warm: Since no sandals are available, ballet flats or sneakers must be worn.');
        updateSeverity('critical', 'weather');
      }
    }
  }

  // --- CHILLY & WINDY (55-70°F or Windy & Under 70°F) ---
  if (isChillyWindy && !isRainy && !isSnowy && !isFreezing) {
    // Outerwear: A sweatshirt (hoodie, sweatshirt, fleece, or cardigan) is mandatory.
    const isSweatshirt = outerwear && (hasTag(outerwear, 'sweater-hoodie') || hasTag(outerwear, 'cardigan') || hasTag(outerwear, 'fleece') || outerwear.name.toLowerCase().includes('hoodie') || outerwear.name.toLowerCase().includes('sweatshirt') || outerwear.name.toLowerCase().includes('sweater'));
    if (!outerwear || !isSweatshirt) {
      reasons.push('🌬️ Chilly & Windy: A sweatshirt, hoodie, or cardigan is mandatory. Heavy coats are not allowed.');
      updateSeverity('critical', 'weather');
    }

    // Tops & Dresses: Preferably long-sleeve; if not in wardrobe, short-sleeve shirt is allowed.
    const isLongSleeve = (usesDress && hasTag(bottom, 'long-sleeve')) || (top && hasTag(top, 'long-sleeve'));
    if (!isLongSleeve) {
      const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
      const hasLongSleeveInWardrobe = wardrobe.some(item => (item.category === 'top' || item.category === 'dress') && hasTag(item, 'long-sleeve'));
      if (hasLongSleeveInWardrobe) {
        reasons.push('🌬️ Chilly & Windy: A long-sleeve shirt or dress is required when available in the wardrobe.');
        updateSeverity('critical', 'weather');
      } else if (top && !hasTag(top, 'short-sleeve')) {
        reasons.push('🌬️ Chilly & Windy: If no long-sleeve shirt is available, a short-sleeve shirt must be worn.');
        updateSeverity('critical', 'weather');
      }
    }

    // Bottoms: Long pants are required.
    if (!isLongPants) {
      reasons.push('🌬️ Chilly & Windy: Long pants are required. Shorts, skirts, and dresses are forbidden.');
      updateSeverity('critical', 'weather');
    }

    // Shoes: Closed shoes are mandatory.
    if (isSandal) {
      reasons.push('🌬️ Chilly & Windy: Closed shoes are mandatory. Open sandals are forbidden.');
      updateSeverity('critical', 'weather');
    }
    if (isWinterBoot) {
      reasons.push('🌬️ Chilly & Windy: Heavy winter boots are unnecessary in chilly weather.');
      updateSeverity('critical', 'weather');
    }
  }

  // --- RAINY & DAMP (condition === 'rainy') ---
  if (isRainy) {
    // Outerwear: A coat (waterproof rain jacket or warm coat) is mandatory.
    const isCoat = outerwear && (hasTag(outerwear, 'jacket-coat') || outerwear.name.toLowerCase().includes('coat') || outerwear.name.toLowerCase().includes('jacket') || outerwear.name.toLowerCase().includes('parka'));
    if (!outerwear || !isCoat) {
      reasons.push('🌧️ Rainy & Damp: A protective coat or rain jacket is mandatory.');
      updateSeverity('critical', 'weather');
    }

    // Tops & Dresses: Long-sleeve shirt or long-sleeve dress is mandatory.
    const isLongSleeve = (usesDress && hasTag(bottom, 'long-sleeve')) || (top && hasTag(top, 'long-sleeve'));
    if (!isLongSleeve) {
      const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
      const hasLongSleevePETop = wardrobe.some(item => item.category === 'top' && hasTag(item, 'long-sleeve') && hasTag(item, 'PE-friendly'));
      
      if (isPE || isFieldTrip) {
        if (hasLongSleevePETop) {
          reasons.push('🌧️ Rainy & Damp: A long-sleeve sporty top is required for PE/Field Trip today.');
          updateSeverity('critical', 'weather');
        } else {
          // Allow short-sleeve sporty top since no long-sleeve sporty top exists in wardrobe
          if (top && !hasTag(top, 'short-sleeve')) {
            reasons.push('🌧️ Rainy & Damp: A short-sleeve sporty top is required.');
            updateSeverity('critical', 'weather');
          }
        }
      } else {
        reasons.push('🌧️ Rainy & Damp: A long-sleeve shirt or long-sleeve dress is mandatory.');
        updateSeverity('critical', 'weather');
      }
    }

    // Bottoms: Long pants are mandatory.
    if (!usesDress && !isLongPants) {
      reasons.push('🌧️ Rainy & Damp: Long pants are mandatory to protect against damp chill.');
      updateSeverity('critical', 'weather');
    }

    // Shoes: Boots mandatory, unless PE or Field Trip day (where sneakers are required).
    if (isPE || isFieldTrip) {
      if (!isSneaker) {
        reasons.push('🌧️ Rainy & Damp: Active sneakers are mandatory for PE/Field Trip today, even in the rain.');
        updateSeverity('critical', 'weather');
      }
    } else {
      if (!isRainBoot && !isWinterBoot) {
        reasons.push('🌧️ Rainy & Damp: Waterproof boots are mandatory on regular rainy school days.');
        updateSeverity('critical', 'weather');
      }
    }

    // Forbidden
    if (isSandal) {
      reasons.push('🌧️ Rainy & Damp: Sandals are forbidden in wet rainy conditions.');
      updateSeverity('critical', 'weather');
    }
    if (isBalletFlat) {
      reasons.push('🌧️ Rainy & Damp: Ballet flats are forbidden in wet rainy conditions.');
      updateSeverity('critical', 'weather');
    }
    if (isShorts) {
      reasons.push('🌧️ Rainy & Damp: Shorts are forbidden in wet rainy conditions.');
      updateSeverity('critical', 'weather');
    }
  }

  // --- SNOWY & FREEZING (snowy or temp < 40) ---
  if (isSnowy || isFreezing) {
    // Outerwear: A heavy coat is mandatory; a sweatshirt/hoodie alone is forbidden.
    const isHeavyCoat = outerwear && (hasTag(outerwear, 'Heavy warm') || hasTag(outerwear, 'puffy') || hasTag(outerwear, 'puffer') || outerwear.warmRating >= 5);
    if (!outerwear || !isHeavyCoat) {
      reasons.push('❄️ Snowy & Freezing: A heavy winter coat is mandatory. Hoodies and sweatshirts are not sufficient.');
      updateSeverity('critical', 'weather');
    }

    // Tops & Bottoms: Long-sleeve shirt and long pants are mandatory.
    if (usesDress || isSkirt || isShorts) {
      reasons.push('❄️ Snowy & Freezing: Long pants and a long-sleeve shirt are mandatory. Dresses, skirts, and shorts are forbidden.');
      updateSeverity('critical', 'weather');
    }
    
    if (top && !hasTag(top, 'long-sleeve')) {
      const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
      const hasLongSleevePETop = wardrobe.some(item => item.category === 'top' && hasTag(item, 'long-sleeve') && hasTag(item, 'PE-friendly'));
      
      if (isPE || isFieldTrip) {
        if (hasLongSleevePETop) {
          reasons.push('❄️ Snowy & Freezing: A long-sleeve sporty top is mandatory.');
          updateSeverity('critical', 'weather');
        } else {
          // Allow short-sleeve sporty top since no long-sleeve sporty top exists in wardrobe
          if (top && !hasTag(top, 'short-sleeve')) {
            reasons.push('❄️ Snowy & Freezing: A short-sleeve sporty top is required.');
            updateSeverity('critical', 'weather');
          }
        }
      } else {
        reasons.push('❄️ Snowy & Freezing: A long-sleeve shirt is mandatory.');
        updateSeverity('critical', 'weather');
      }
    }
    if (!isLongPants) {
      reasons.push('❄️ Snowy & Freezing: Long pants are mandatory.');
      updateSeverity('critical', 'weather');
    }

    // Footwear: Boots if there is rain, or closed shoes like sneakers if there is no rain.
    if (isRainy) {
      if (!isRainBoot && !isWinterBoot) {
        reasons.push('❄️ Snowy & Freezing (Rainy): Waterproof boots are mandatory in freezing rain.');
        updateSeverity('critical', 'weather');
      }
    } else {
      if (!isSneaker && !isWinterBoot && !isRainBoot) {
        reasons.push('❄️ Snowy & Freezing: Closed shoes like sneakers or winter boots are mandatory.');
        updateSeverity('critical', 'weather');
      }
    }

    // Forbidden
    if (isSandal) {
      reasons.push('❄️ Snowy & Freezing: Sandals are strictly forbidden in freezing weather.');
      updateSeverity('critical', 'weather');
    }

    if (child.id === 'emma') {
      const hasScarf = accessory && (accessory.id === 'e_acc_scarf' || hasTag(accessory, 'Warm layer') || hasTag(accessory, 'scarf'));
      if (!hasScarf) {
        reasons.push('❄️ Snowy & Freezing: Missing winter scarf');
        updateSeverity('warning', 'weather');
      }
    }
  }

  // =========================================================================
  // 3. SCHOOL ACTIVITY RULES (Mandatory)
  // =========================================================================

  // --- PE / GYM DAY & FIELD TRIP ---
  if (isPE || isFieldTrip) {
    if (!isSneaker) {
      reasons.push(`${isPE ? '🏃 PE / Gym Day' : '🚌 Field Trip'}: Running sneakers are mandatory, even in rainy weather.`);
      updateSeverity('critical', 'school');
    }
    if (usesDress || isSkirt) {
      reasons.push(`${isPE ? '🏃 PE / Gym Day' : '🚌 Field Trip'}: Dresses and skirts are strictly forbidden.`);
      updateSeverity('critical', 'school');
    }
    if (bottom && (hasTag(bottom, 'jeans') || bottom.name.toLowerCase().includes('jeans') || bottom.name.toLowerCase().includes('denim'))) {
      reasons.push(`${isPE ? '🏃 PE / Gym Day' : '🚌 Field Trip'}: Jeans or denim clothing are strictly forbidden.`);
      updateSeverity('critical', 'school');
    }
    const isSportyBottom = bottom && hasTag(bottom, 'PE-friendly');
    if (bottom && !isSportyBottom && !usesDress && !isSkirt) {
      reasons.push(`${isPE ? '🏃 PE / Gym Day' : '🚌 Field Trip'}: Stretchy athletic pants or active shorts are required.`);
      updateSeverity('critical', 'school');
    }
    if (top && !hasTag(top, 'PE-friendly')) {
      reasons.push(`${isPE ? '🏃 PE / Gym Day' : '🚌 Field Trip'}: A sporty active top is required.`);
      updateSeverity('critical', 'school');
    }
  }

  // --- ART CLASS ---
  if (isArt) {
    const isWhite = (top && top.color.toLowerCase() === 'white') || 
                    (bottom && bottom.color.toLowerCase() === 'white') ||
                    (outerwear && outerwear.color.toLowerCase() === 'white');
    const isDelicate = (top && (hasTag(top, 'formal') || hasTag(top, 'delicate') || hasTag(top, 'lace') || hasTag(top, 'sequined'))) ||
                       (bottom && (hasTag(bottom, 'formal') || hasTag(bottom, 'delicate') || hasTag(bottom, 'tulle') || hasTag(bottom, 'sequined') || bottom.name.toLowerCase().includes('party') || bottom.name.toLowerCase().includes('fancy')));
    
    if (isWhite) {
      reasons.push('🎨 Art Class: White clothing is strictly forbidden to prevent permanent paint stains.');
      updateSeverity('critical', 'school');
    }
    if (isDelicate || (usesDress && isDelicate)) {
      reasons.push('🎨 Art Class: Fancy, delicate, or formal dresses/clothing are strictly forbidden.');
      updateSeverity('critical', 'school');
    }
    if (!isSneaker) {
      reasons.push('🎨 Art Class: Sneakers are required for moving around the workshop.');
      updateSeverity('critical', 'school');
    }
  }

  // --- PICTURE DAY ---
  if (isPictureDay) {
    const isApprovedOutfit = usesDress || (top && isSkirt);
    if (!isApprovedOutfit) {
      reasons.push('📸 Picture Day: A nice dress or a nice blouse + skirt is required for school photos.');
      updateSeverity('critical', 'school');
    }
    if (!isBalletFlat && !isSandal) {
      reasons.push('📸 Picture Day: Nice ballet flats or sandals are required.');
      updateSeverity('critical', 'school');
    }
    if (isSneaker) {
      reasons.push('📸 Picture Day: Running shoes are strictly forbidden.');
      updateSeverity('critical', 'school');
    }
    const isSportswear = (top && (hasTag(top, 'PE-friendly') || hasTag(top, 'sporty') || hasTag(top, 'active'))) ||
                         (bottom && (hasTag(bottom, 'PE-friendly') || hasTag(bottom, 'sporty') || hasTag(bottom, 'active') || isShorts));
    if (isSportswear) {
      reasons.push('📸 Picture Day: Sportswear is strictly forbidden.');
      updateSeverity('critical', 'school');
    }
  }

  // =========================================================================
  // 4. SENSORY RULES (Warning/Critical depending on child dislikes)
  // =========================================================================
  const checkSensoryIssues = (item: any) => {
    if (!item) return;
    for (const dislike of child.sensoryDislikes) {
      if (hasTag(item, dislike)) {
        reasons.push(`🧩 Sensory Dislike: "${item.name}" triggers sensory discomfort (${dislike}).`);
        updateSeverity('critical', 'profile'); // Mandatory comfort!
      }
    }
  };

  if (top) checkSensoryIssues(top);
  checkSensoryIssues(bottom);
  checkSensoryIssues(shoes);
  if (outerwear) checkSensoryIssues(outerwear);
  if (accessory) checkSensoryIssues(accessory);

  // =========================================================================
  // 5. FEEDBACK MEMORY RULES (Warning/Optimization)
  // =========================================================================
  if (feedbackMemory) {
    // Warmth offset checks
    if (feedbackMemory.warmthOffset < 0 && temp >= 70 && outerwear) {
      reasons.push(`💬 Feedback: ${child.name} previously felt Too Warm. Lighter layers preferred.`);
      updateSeverity('warning', 'feedback');
    }
    if (feedbackMemory.warmthOffset > 0 && temp < 60 && !outerwear) {
      reasons.push(`💬 Feedback: ${child.name} previously felt Too Cold. Warmer layers preferred.`);
      updateSeverity('warning', 'feedback');
    }

    // Disliked combo check
    const comboKey = `${top ? top.id : 'none'}-${bottom.id}-${shoes.id}`;
    if (feedbackMemory.dislikedOutfits && feedbackMemory.dislikedOutfits.includes(comboKey)) {
      reasons.push('💬 Feedback: This specific outfit combination was previously disliked.');
      updateSeverity('critical', 'feedback'); // Do not recommend disliked combos!
    }
  }

  // =========================================================================
  // SUMMARY & EXPERIENCED PARENT VALIDATION MESSAGE
  // =========================================================================
  const isValid = status.severity !== 'critical';
  const uniqueReasons = Array.from(new Set(reasons)).slice(0, 3); // cap at 3 reasons

  let recommendedAction = 'Current outfit looks fully prepared, safe, and comfortable!';
  if (status.severity === 'critical') {
    recommendedAction = "⚠️ Parent Decision: No, an experienced parent would NOT send their child in this outfit today. Regenerate immediately!";
  } else if (status.severity === 'warning') {
    recommendedAction = "⚠️ Parent Decision: This outfit is acceptable, but minor styling updates are recommended.";
  }

  return {
    isValid,
    severity: status.severity,
    reasons: uniqueReasons,
    recommendedAction,
    failedAgents
  };
}
