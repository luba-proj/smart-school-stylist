import type { Child } from '../types';

export const mockChildren: Child[] = [
  {
    id: 'emma',
    name: 'Emma',
    age: 11,
    preferences: ['Unicorns', 'Pastel Pink & Purple', 'Flowy Skirts', 'Cute Accessories', 'Graphic Tees'],
    sensoryDislikes: ['Scratchy tags', 'Stiff denim', 'Itchy wool', 'Rough seams'],
    avatarColor: '#ec4899', // Pink
    themeGradient: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)' // Soft pink-to-rose
  },
  {
    id: 'mia',
    name: 'Mia',
    age: 7,
    preferences: ['Sporty styles', 'Bright Blue & Teal', 'Comfortable Shorts', 'Soccer theme', 'Activewear'],
    sensoryDislikes: ['Tight collars', 'Squeezing waistbands', 'Heavy fabrics', 'Restrictive jackets'],
    avatarColor: '#0ea5e9', // Sky blue
    themeGradient: 'linear-gradient(135deg, #bae6fd 0%, #38bdf8 100%)' // Soft sky-to-teal
  }
];
