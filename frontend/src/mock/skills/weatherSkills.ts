// Weather Agent Skills
// This file defines the lightweight skills representing the Weather Agent's capabilities.
import type { WeatherCondition } from '../../types';

/**
 * Skill: Analyze Weather Conditions
 * Summarizes the forecast details.
 */
export function analyzeWeather(weather: WeatherCondition): string {
  return `Weather analysis for ${weather.temp}°F, condition: ${weather.condition}.`;
}

/**
 * Skill: Determine Layering Requirements
 * Identifies whether layers/outerwear/accessories are required based on temperature and conditions.
 */
export function determineLayeringNeeds(
  temp: number,
  condition: string
): {
  outerwearRequired: boolean;
  heavyOuterwearRequired: boolean;
  warmAccessoryRequired: boolean;
} {
  const isRainy = condition === 'rainy';
  const isSnowy = condition === 'snowy';
  const isFreezing = temp < 40;
  const isChillyWindy = ((temp >= 40 && temp < 70) || (condition === 'windy' && temp < 70)) && !isRainy && !isSnowy && !isFreezing;

  let outerwearRequired = false;
  let heavyOuterwearRequired = false;
  let warmAccessoryRequired = false;

  if (isRainy) {
    outerwearRequired = true;
  } else if (isSnowy || isFreezing) {
    outerwearRequired = true;
    heavyOuterwearRequired = true;
    warmAccessoryRequired = true;
  } else if (isChillyWindy) {
    outerwearRequired = true;
  }

  return { outerwearRequired, heavyOuterwearRequired, warmAccessoryRequired };
}

/**
 * Skill: Determine Footwear Requirements
 * Evaluates the required shoe tags/types based on weather forecast.
 */
export function determineFootwearNeeds(temp: number, condition: string): string[] {
  const needs: string[] = [];
  if (condition === 'rainy') {
    needs.push('rain-boots', 'boots');
  } else if (condition === 'snowy' || temp < 40) {
    needs.push('boots', 'sneakers');
  } else if (temp >= 70) {
    needs.push('sandals');
  } else {
    needs.push('closed-toe');
  }
  return needs;
}

/**
 * Skill: Determine Outerwear Requirements
 * Identifies the type of outerwear needed based on temperature and conditions.
 */
export function determineOuterwearNeeds(temp: number, condition: string): string {
  if (condition === 'rainy') return 'raincoat';
  if (condition === 'snowy' || temp < 40) return 'heavy-coat';
  if (temp < 70 || condition === 'windy') return 'sweatshirt-hoodie';
  return 'none';
}
