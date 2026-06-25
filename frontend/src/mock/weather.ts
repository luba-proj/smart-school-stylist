import type { WeatherCondition } from '../types';

export const mockWeatherScenarios: Record<string, WeatherCondition> = {
  sunny: {
    temp: 74,
    condition: 'sunny',
    icon: '☀️',
    message: 'It is a beautiful, warm day! Light, breathable clothing is best. Don\'t forget sunscreen!',
    high: 78,
    low: 62
  },
  windy: {
    temp: 52,
    condition: 'windy',
    icon: '💨',
    message: 'Chilly morning breeze and strong winds! A windbreaker or layered jacket is highly recommended.',
    high: 56,
    low: 45
  },
  rainy: {
    temp: 58,
    condition: 'rainy',
    icon: '🌧️',
    message: 'Rainy and damp today! A waterproof raincoat, hood, and sturdy water-resistant shoes are needed.',
    high: 60,
    low: 50
  },
  snowy: {
    temp: 28,
    condition: 'snowy',
    icon: '❄️',
    message: 'Brrr! Freezing temperatures and snow on the ground. Bundle up with heavy winter coats, gloves, and boots!',
    high: 32,
    low: 20
  }
};
