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

  // Weather classifications
  const isRainy = condition === 'rainy';
  const isSnowy = condition === 'snowy';
  const isFreezing = temp < 40;
  const isSunnyWarm = temp >= 70;
  const isChillyWindy = !isRainy && !isSnowy && !isFreezing && ((temp >= 40 && temp < 70) || (condition === 'windy' && temp < 70));
  const isSnowyOrFreezing = isSnowy || isFreezing;

  // Activity classifications
  const isPE = school.isPEDay || school.activity.toLowerCase().includes('pe') || school.activity.toLowerCase().includes('gym') || school.activity.toLowerCase().includes('sports') || school.activity.toLowerCase().includes('soccer');
  const isArt = school.activity.toLowerCase().includes('art');
  const isFieldTrip = school.activity.toLowerCase().includes('field');
  const isPictureDay = school.activity.toLowerCase().includes('picture') || school.activity.toLowerCase().includes('photo');
  const isPEOrTrip = isPE || isFieldTrip;

  // Bottom / Dress classifications
  const usesDress = bottom && (bottom.category === 'dress' || hasTag(bottom, 'dress'));
  const isSkirt = bottom && hasTag(bottom, 'skirt') && !usesDress;
  const isShorts = bottom && hasTag(bottom, 'shorts') && !usesDress;
  const isLongPants = bottom && (hasTag(bottom, 'leggings') || hasTag(bottom, 'jeans') || hasTag(bottom, 'pants')) && !usesDress && !isSkirt && !isShorts;

  // Shoe classifications
  const isSandal = shoes && (hasTag(shoes, 'sandals') || shoes.name.toLowerCase().includes('sandal'));
  const isBalletFlat = shoes && hasTag(shoes, 'ballet-flats') && !isSandal;
  const isSneaker = shoes && (hasTag(shoes, 'Sneakers') || hasTag(shoes, 'sneakers') || shoes.name.toLowerCase().includes('running'));
  const isRainBoot = shoes && (hasTag(shoes, 'rain-boots') || shoes.name.toLowerCase().includes('rain'));
  const isWinterBoot = shoes && hasTag(shoes, 'boots') && !isRainBoot && !isSneaker;

  // =========================================================================
  // 1. DRESS & STRUCTURE RULES (Mandatory)
  // =========================================================================
  if (usesDress) {
    if (top) {
      reasons.push('Dress Rule: A dress replaces a top and bottom. Do not pair with a top shirt.');
      updateSeverity('critical', 'stylist');
    }
    if (!shoes) {
      reasons.push('Dress Rule: An outfit using a dress must include shoes.');
      updateSeverity('critical', 'stylist');
    }
    const weatherRequiresOuterwear = isRainy || isSnowyOrFreezing || isChillyWindy;
    if (!weatherRequiresOuterwear && outerwear) {
      reasons.push('Dress Rule: Outerwear is not needed and should be omitted in warm weather.');
      updateSeverity('critical', 'weather');
    }
  } else {
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

  // =========================================================================
  // 2. INTEGRATED WEATHER & SCHOOL ACTIVITY RULES (Precise Rule Matrix)
  // =========================================================================

  // --- SUNNY & WARM (70°F+) ---
  if (isSunnyWarm) {
    // TOP
    if (usesDress) {
      if (hasTag(bottom, 'long-sleeve')) {
        reasons.push('🌤️ Sunny & Warm: Long-sleeve dresses are forbidden. Short-sleeve dress is required.');
        updateSeverity('critical', 'weather');
      }
    } else {
      if (top && !hasTag(top, 'short-sleeve')) {
        reasons.push('🌤️ Sunny & Warm: Long-sleeve shirts are forbidden. Short-sleeve top is required.');
        updateSeverity('critical', 'weather');
      }
    }

    if (top && (hasTag(top, 'sweater-hoodie') || hasTag(top, 'sweatshirt') || top.name.toLowerCase().includes('sweatshirt') || top.name.toLowerCase().includes('hoodie'))) {
      reasons.push('🌤️ Sunny & Warm: Sweatshirts and hoodies are forbidden.');
      updateSeverity('critical', 'weather');
    }

    // BOTTOM
    if (!usesDress) {
      if (isPEOrTrip) {
        // Event overrides weather: PE/Trip requires sports pants/leggings/sweatpants or active shorts. Jeans forbidden.
        const isSportyBottom = bottom && hasTag(bottom, 'PE-friendly');
        const isJeans = bottom && (hasTag(bottom, 'jeans') || bottom.name.toLowerCase().includes('jeans') || bottom.name.toLowerCase().includes('denim'));
        if (isJeans) {
          reasons.push('🏃 PE / Gym: Jeans or denim are forbidden.');
          updateSeverity('critical', 'school');
        }
        if (!isSportyBottom) {
          reasons.push('🏃 PE / Gym: Sporty pants, leggings, sweatpants, or active shorts are required.');
          updateSeverity('critical', 'school');
        }
      } else if (isPictureDay) {
        // Event overrides weather: Skirt or festive pants required. Sports pants forbidden.
        const isSporty = bottom && hasTag(bottom, 'PE-friendly') && !isSkirt;
        if (isSporty) {
          reasons.push('📸 Picture Day: Sports pants are forbidden.');
          updateSeverity('critical', 'school');
        }
        if (!isSkirt && !isLongPants) {
          reasons.push('📸 Picture Day: A neat skirt or festive pants are required.');
          updateSeverity('critical', 'school');
        }
      } else {
        // Regular Day & Art Class: Shorts mandatory for weather.
        if (!isShorts) {
          reasons.push('🌤️ Sunny & Warm: Shorts are mandatory on a regular warm day.');
          updateSeverity('critical', 'weather');
        }
      }
    }

    // SHOES
    if (isPEOrTrip) {
      // Event overrides weather: sneakers mandatory
      if (!isSneaker) {
        reasons.push('🏃 PE / Gym: Sneakers are mandatory, even in warm weather.');
        updateSeverity('critical', 'school');
      }
    } else if (isArt) {
      if (!isSneaker) {
        reasons.push('🎨 Art Class: Sneakers are required.');
        updateSeverity('critical', 'school');
      }
    } else if (isPictureDay) {
      // Event overrides weather: ballet flats or sandals required. running shoes forbidden.
      if (!isBalletFlat && !isSandal) {
        reasons.push('📸 Picture Day: Ballet flats or sandals are required.');
        updateSeverity('critical', 'school');
      }
      if (isSneaker) {
        reasons.push('📸 Picture Day: Running shoes are forbidden.');
        updateSeverity('critical', 'school');
      }
    } else {
      // Regular day: Preference for sandals/flip-flops; if none, ballet flats/sneakers. Boots forbidden.
      if (isWinterBoot || isRainBoot) {
        reasons.push('🌤️ Sunny & Warm: Boots are strictly forbidden in warm weather.');
        updateSeverity('critical', 'weather');
      }
      const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
      const hasOpenShoe = wardrobe.some(item => item.category === 'shoes' && (hasTag(item, 'sandals') || item.name.toLowerCase().includes('sandal')));
      if (hasOpenShoe && !isSandal) {
        reasons.push('🌤️ Sunny & Warm: Sandals are preferred in warm weather when available.');
        updateSeverity('warning', 'weather');
      }
    }

    // OUTERWEAR
    if (outerwear) {
      reasons.push('🌤️ Sunny & Warm: Outerwear (coats, sweatshirts, cardigans) is strictly forbidden in warm weather.');
      updateSeverity('critical', 'weather');
    }

    // ACCESSORY
    if (isFieldTrip) {
      const hasHat = accessory && (hasTag(accessory, 'Sun protection') || hasTag(accessory, 'hat') || accessory.name.toLowerCase().includes('hat'));
      if (!hasHat) {
        reasons.push('🚌 Field Trip: A sun hat is recommended for outdoor activities.');
        updateSeverity('warning', 'school');
      }
    }
  }

  // --- CHILLY & WINDY (55-70°F / Chilly & Windy conditions) ---
  if (isChillyWindy) {
    // TOP / OUTERWEAR
    // Sweatshirt is mandatory. Coat is not allowed.
    const isSweatshirt = outerwear && (hasTag(outerwear, 'sweater-hoodie') || hasTag(outerwear, 'cardigan') || hasTag(outerwear, 'fleece') || outerwear.name.toLowerCase().includes('hoodie') || outerwear.name.toLowerCase().includes('sweatshirt') || outerwear.name.toLowerCase().includes('sweater'));
    const isHeavyCoat = outerwear && (hasTag(outerwear, 'Heavy warm') || hasTag(outerwear, 'puffy') || hasTag(outerwear, 'puffer') || outerwear.warmRating >= 5);
    
    if (!outerwear || !isSweatshirt) {
      reasons.push('🌬️ Chilly & Windy: A sweatshirt, hoodie, or cardigan is mandatory.');
      updateSeverity('critical', 'weather');
    }
    if (isHeavyCoat) {
      reasons.push('🌬️ Chilly & Windy: Heavy coats are forbidden. A lighter sweatshirt is preferred.');
      updateSeverity('critical', 'weather');
    }

    // Tops & Dresses: Preferably long-sleeve; if not in wardrobe, short-sleeve under sweatshirt.
    const isLongSleeve = (usesDress && hasTag(bottom, 'long-sleeve')) || (top && hasTag(top, 'long-sleeve'));
    const wardrobe = child.id === 'emma' ? emmaWardrobe : miaWardrobe;
    const hasLongSleeveInWardrobe = wardrobe.some(item => (item.category === 'top' || item.category === 'dress') && hasTag(item, 'long-sleeve'));
    
    if (!isLongSleeve && hasLongSleeveInWardrobe) {
      reasons.push('🌬️ Chilly & Windy: A long-sleeve shirt or dress is required when available.');
      updateSeverity('warning', 'weather');
    }

    // BOTTOM
    if (!usesDress) {
      if (isPEOrTrip) {
        const isSportyBottom = bottom && hasTag(bottom, 'PE-friendly');
        const isJeans = bottom && (hasTag(bottom, 'jeans') || bottom.name.toLowerCase().includes('jeans') || bottom.name.toLowerCase().includes('denim'));
        if (isJeans) {
          reasons.push('🏃 PE / Gym: Jeans are forbidden.');
          updateSeverity('critical', 'school');
        }
        if (!isSportyBottom || !isLongPants) {
          reasons.push('🏃 PE / Gym: Long sporty pants, leggings, or sweatpants are required.');
          updateSeverity('critical', 'school');
        }
      } else if (isPictureDay) {
        if (!isSkirt && !isLongPants) {
          reasons.push('📸 Picture Day: A neat skirt or festive pants are required.');
          updateSeverity('critical', 'school');
        }
      } else {
        if (!isLongPants) {
          reasons.push('🌬️ Chilly & Windy: Long pants are required. Shorts and skirts are forbidden.');
          updateSeverity('critical', 'weather');
        }
      }
    }

    // SHOES
    if (isPEOrTrip || isArt) {
      if (!isSneaker) {
        reasons.push('🏃 School Activity: Sneakers are mandatory.');
        updateSeverity('critical', 'school');
      }
    } else if (isPictureDay) {
      // Event says ballet flats or sandals. Weather safety says closed shoes (no sandals). So ballet flats preferred!
      if (!isBalletFlat) {
        reasons.push('📸 Picture Day: Neat ballet flats are required for cold weather photo shoots.');
        updateSeverity('warning', 'school');
      }
      if (isSandal) {
        reasons.push('🌬️ Chilly & Windy: Open sandals are forbidden.');
        updateSeverity('critical', 'weather');
      }
    } else {
      // Regular Day
      if (isSandal) {
        reasons.push('🌬️ Chilly & Windy: Closed shoes are mandatory. Open sandals are forbidden.');
        updateSeverity('critical', 'weather');
      }
      if (isWinterBoot || isRainBoot) {
        reasons.push('🌬️ Chilly & Windy: Heavy boots are unnecessary in chilly weather.');
        updateSeverity('warning', 'weather');
      }
    }
  }

  // --- RAINY & DAMP ---
  if (isRainy) {
    // TOP
    const isLongSleeve = (usesDress && hasTag(bottom, 'long-sleeve')) || (top && hasTag(top, 'long-sleeve'));
    if (!isLongSleeve) {
      reasons.push('🌧️ Rainy & Damp: A long-sleeve shirt or dress is mandatory.');
      updateSeverity('critical', 'weather');
    }

    // BOTTOM
    if (!usesDress && !isLongPants) {
      reasons.push('🌧️ Rainy & Damp: Long pants are mandatory. Shorts and skirts are forbidden.');
      updateSeverity('critical', 'weather');
    }

    // OUTERWEAR
    const isCoat = outerwear && (hasTag(outerwear, 'jacket-coat') || outerwear.name.toLowerCase().includes('coat') || outerwear.name.toLowerCase().includes('jacket') || outerwear.name.toLowerCase().includes('parka'));
    if (!outerwear || !isCoat) {
      reasons.push('🌧️ Rainy & Damp: A protective coat or rain jacket is mandatory.');
      updateSeverity('critical', 'weather');
    }

    // SHOES
    if (isPEOrTrip || isArt) {
      // Event overrides weather shoe type: Sneakers mandatory
      if (!isSneaker) {
        reasons.push('🏃 School Activity: Active sneakers are mandatory today.');
        updateSeverity('critical', 'school');
      }
    } else if (isPictureDay) {
      // Event says ballet flats or sandals. Weather safety says boots.
      // Sandals are highly unsafe/unsuitable. Ballet flats are better, but boots are best for rain.
      if (isSandal) {
        reasons.push('🌧️ Rainy & Damp: Sandals are forbidden in wet rainy conditions.');
        updateSeverity('critical', 'weather');
      }
    } else {
      // Regular Day: Boots mandatory
      if (!isRainBoot && !isWinterBoot) {
        reasons.push('🌧️ Rainy & Damp: Waterproof boots are mandatory.');
        updateSeverity('critical', 'weather');
      }
    }
  }

  // --- SNOWY & FREEZING ---
  if (isSnowyOrFreezing) {
    // TOP & BOTTOM
    const isLongSleeve = top && hasTag(top, 'long-sleeve');
    if (!isLongSleeve) {
      reasons.push('❄️ Snowy & Freezing: A long-sleeve shirt is mandatory.');
      updateSeverity('critical', 'weather');
    }
    if (usesDress || isSkirt || isShorts) {
      reasons.push('❄️ Snowy & Freezing: Long pants are mandatory. Dresses, skirts, and shorts are strictly forbidden.');
      updateSeverity('critical', 'weather');
    }

    // OUTERWEAR
    const isHeavyCoat = outerwear && (hasTag(outerwear, 'Heavy warm') || hasTag(outerwear, 'puffy') || hasTag(outerwear, 'puffer') || outerwear.warmRating >= 5);
    if (!outerwear || !isHeavyCoat) {
      reasons.push('❄️ Snowy & Freezing: A heavy winter coat is mandatory. Hoodies and sweatshirts are not sufficient.');
      updateSeverity('critical', 'weather');
    }

    // SHOES
    if (isPEOrTrip || isArt) {
      if (!isSneaker) {
        reasons.push('🏃 School Activity: Active sneakers are mandatory.');
        updateSeverity('critical', 'school');
      }
    } else {
      // Regular / Picture Day
      if (isRainy || isSnowy) {
        if (!isRainBoot && !isWinterBoot) {
          reasons.push('❄️ Snowy & Freezing: Waterproof boots are mandatory in snow/wet conditions.');
          updateSeverity('critical', 'weather');
        }
      } else {
        if (!isSneaker && !isWinterBoot && !isRainBoot) {
          reasons.push('❄️ Snowy & Freezing: Closed shoes like sneakers or winter boots are mandatory.');
          updateSeverity('critical', 'weather');
        }
      }
      if (isSandal) {
        reasons.push('❄️ Snowy & Freezing: Sandals are strictly forbidden.');
        updateSeverity('critical', 'weather');
      }
    }

    // ACCESSORY
    if (child.id === 'emma') {
      const hasScarf = accessory && (accessory.id === 'e_acc_scarf' || hasTag(accessory, 'Warm layer') || hasTag(accessory, 'scarf'));
      if (!hasScarf) {
        reasons.push('❄️ Snowy & Freezing: A warm winter scarf is highly recommended.');
        updateSeverity('warning', 'weather');
      }
    }
  }

  // =========================================================================
  // 3. EVENT SPECIFIC FORBIDDEN / REQUIRED ITEMS
  // =========================================================================
  if (isPEOrTrip) {
    if (usesDress || isSkirt) {
      reasons.push('🏃 PE / Trip: Dresses and skirts are strictly forbidden.');
      updateSeverity('critical', 'school');
    }
    const isJeans = bottom && (hasTag(bottom, 'jeans') || bottom.name.toLowerCase().includes('jeans') || bottom.name.toLowerCase().includes('denim'));
    if (isJeans) {
      reasons.push('🏃 PE / Trip: Jeans and denim clothing are strictly forbidden.');
      updateSeverity('critical', 'school');
    }
    if (top && !hasTag(top, 'PE-friendly')) {
      reasons.push('🏃 PE / Trip: A sporty active top is required.');
      updateSeverity('critical', 'school');
    }
  }

  if (isArt) {
    const isWhite = (top && top.color.toLowerCase() === 'white') || 
                    (bottom && bottom.color.toLowerCase() === 'white') ||
                    (outerwear && outerwear.color.toLowerCase() === 'white');
    const isDelicate = (top && (hasTag(top, 'formal') || hasTag(top, 'delicate') || hasTag(top, 'lace') || hasTag(top, 'sequined'))) ||
                       (bottom && (hasTag(bottom, 'formal') || hasTag(bottom, 'delicate') || hasTag(bottom, 'tulle') || hasTag(bottom, 'sequined') || bottom.name.toLowerCase().includes('party') || bottom.name.toLowerCase().includes('fancy')));
    
    if (isWhite) {
      reasons.push('🎨 Art Class: White clothing is strictly forbidden to prevent paint stains.');
      updateSeverity('critical', 'school');
    }
    if (isDelicate || (usesDress && isDelicate)) {
      reasons.push('🎨 Art Class: Delicate, formal, or fancy clothing is strictly forbidden.');
      updateSeverity('critical', 'school');
    }
  }

  if (isPictureDay) {
    const isSporty = (top && (hasTag(top, 'PE-friendly') || hasTag(top, 'sporty') || hasTag(top, 'active'))) ||
                     (bottom && (hasTag(bottom, 'PE-friendly') || hasTag(bottom, 'sporty') || hasTag(bottom, 'active')));
    if (isSporty) {
      reasons.push('📸 Picture Day: Sports clothing and athletic wear are forbidden.');
      updateSeverity('critical', 'school');
    }
  }

  // =========================================================================
  // 4. SENSORY RULES
  // =========================================================================
  const checkSensoryIssues = (item: any) => {
    if (!item) return;
    for (const dislike of child.sensoryDislikes) {
      if (hasTag(item, dislike)) {
        reasons.push(`🧩 Sensory Dislike: "${item.name}" triggers sensory discomfort (${dislike}).`);
        updateSeverity('critical', 'profile');
      }
    }
  };

  if (top) checkSensoryIssues(top);
  checkSensoryIssues(bottom);
  checkSensoryIssues(shoes);
  if (outerwear) checkSensoryIssues(outerwear);
  if (accessory) checkSensoryIssues(accessory);

  // =========================================================================
  // 5. FEEDBACK MEMORY RULES
  // =========================================================================
  if (feedbackMemory) {
    if (feedbackMemory.warmthOffset < 0 && temp >= 70 && outerwear) {
      reasons.push(`💬 Feedback: ${child.name} previously felt Too Warm. Lighter layers preferred.`);
      updateSeverity('warning', 'feedback');
    }
    if (feedbackMemory.warmthOffset > 0 && temp < 60 && !outerwear) {
      reasons.push(`💬 Feedback: ${child.name} previously felt Too Cold. Warmer layers preferred.`);
      updateSeverity('warning', 'feedback');
    }
    const comboKey = `${top ? top.id : 'none'}-${bottom.id}-${shoes.id}`;
    if (feedbackMemory.dislikedOutfits && feedbackMemory.dislikedOutfits.includes(comboKey)) {
      reasons.push('💬 Feedback: This specific outfit combination was previously disliked.');
      updateSeverity('critical', 'feedback');
    }
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  const isValid = status.severity !== 'critical';
  const uniqueReasons = Array.from(new Set(reasons)).slice(0, 3);

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
