export interface Child {
  id: string;
  name: string;
  age: number;
  preferences: string[];
  sensoryDislikes: string[];
  avatarColor: string;
  themeGradient: string;
}

export type WeatherType = 'sunny' | 'rainy' | 'windy' | 'snowy';

export interface WeatherCondition {
  temp: number;
  condition: WeatherType;
  icon: string;
  message: string;
  high: number;
  low: number;
}

export interface SchoolContext {
  day: string;
  activity: string;
  specialRequirement: string;
  icon: string;
  isPEDay: boolean;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory' | 'dress';
  color: string;
  warmRating: number; // 1 (coolest) to 5 (warmest)
  tags: string[];
  isFavorite: boolean;
  emoji: string;
  image: string;
  fallbackSvg?: string;
}

export interface Outfit {
  childId: string;
  top: WardrobeItem | null;
  bottom: WardrobeItem;
  shoes: WardrobeItem;
  outerwear: WardrobeItem | null;
  accessory: WardrobeItem | null;
  stylistNotes: string;
  suitabilityScore: number;
}

export interface FeedbackLog {
  id: string;
  childId: string;
  timestamp: string;
  rating: 'like' | 'dislike' | 'too_warm' | 'too_cold';
  outfitSummary: string;
}

export interface ChildFeedbackMemory {
  likedColors: string[];
  likedTags: string[];
  dislikedOutfits: string[]; // combo keys e.g. "topId-bottomId-shoesId"
  warmthOffset: number;
}

