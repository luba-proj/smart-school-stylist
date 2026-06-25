import type { SchoolContext } from '../types';

export const mockSchoolScenarios: Record<string, SchoolContext> = {
  regular: {
    day: 'Monday',
    activity: 'Standard Classroom Lessons',
    specialRequirement: 'Standard comfortable school wear.',
    icon: '🏫',
    isPEDay: false
  },
  pe: {
    day: 'Tuesday',
    activity: 'Physical Education (Gym & Track)',
    specialRequirement: 'Sneakers/athletic shoes and stretchy, breathable athletic clothing required.',
    icon: '🏃‍♀️',
    isPEDay: true
  },
  art: {
    day: 'Wednesday',
    activity: 'Art Workshop (Acrylic Painting & Clay)',
    specialRequirement: 'Messy day! Avoid brand-new or white clothes. Wear easily washable, dark-colored clothing.',
    icon: '🎨',
    isPEDay: false
  },
  fieldtrip: {
    day: 'Thursday',
    activity: 'Field Trip to the Science Museum',
    specialRequirement: 'Comfortable walking shoes are mandatory. Wear the bright blue School Spirit T-Shirt for easy group tracking!',
    icon: '🚌',
    isPEDay: false
  },
  picture: {
    day: 'Friday',
    activity: 'School Picture Day',
    specialRequirement: 'Say cheese! Dressy or neat clothing preferred. Avoid athletic-only or overly casual clothing.',
    icon: '📸',
    isPEDay: false
  }
};
