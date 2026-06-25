import React from 'react';
import type { Outfit, Child, WeatherCondition, SchoolContext } from '../types';

// Determine Aura's Focus Today dynamically based on weather, school context, and outfit
const getAuraFocus = (
  outfit: Outfit,
  school: SchoolContext,
  weather: WeatherCondition,
  child: Child,
  currentFeedback: 'like' | 'dislike' | 'too_warm' | 'too_cold' | null
) => {
  if (currentFeedback === 'too_warm') {
    return {
      icon: '☀️',
      title: "Stay Cool",
      description: "Aura replaced heavier items with lighter, more breathable clothing."
    };
  }
  if (currentFeedback === 'too_cold') {
    return {
      icon: '❄️',
      title: "Stay Warm",
      description: "Aura added warmer layers for better comfort."
    };
  }
  if (currentFeedback === 'dislike') {
    return {
      icon: '🔄',
      title: "New Direction",
      description: "Aura generated a different outfit based on your feedback."
    };
  }
  if (currentFeedback === 'like') {
    return {
      icon: '❤️',
      title: "Great Choice",
      description: `Aura saved this style as one of ${child.name}'s favorites.`
    };
  }

  const hasWinterCoat = outfit.outerwear && (outfit.outerwear.tags.includes('jacket-coat') || outfit.outerwear.warmRating >= 4);
  const hasWinterBoots = outfit.shoes && outfit.shoes.tags.includes('boots') && !outfit.shoes.tags.includes('rain-boots');
  const hasRaincoat = outfit.outerwear && outfit.outerwear.tags.includes('Waterproof');
  const hasRainboots = outfit.shoes && (outfit.shoes.tags.includes('rain-boots') || outfit.shoes.tags.includes('Waterproof'));
  const isPEDay = school.isPEDay || school.activity.toLowerCase().includes('pe') || school.activity.toLowerCase().includes('physical education');
  const isArtClass = school.activity.toLowerCase().includes('art');
  const isPictureDay = school.activity.toLowerCase().includes('picture');

  // 1. Snowy / Freezing
  if (weather.condition === 'snowy' || weather.temp < 40 || hasWinterCoat || hasWinterBoots) {
    return {
      icon: '❄️',
      title: "Winter Comfort",
      description: `Today's priority was keeping ${child.name} warm while maintaining comfort.`
    };
  }

  // 2. Rainy
  if (weather.condition === 'rainy' || hasRaincoat || hasRainboots) {
    return {
      icon: '☔',
      title: "Stay Dry",
      description: `Today's priority was keeping ${child.name} dry with waterproof clothing.`
    };
  }

  // 3. PE Day
  if (isPEDay) {
    return {
      icon: '🏃',
      title: "Move Freely",
      description: `Today's priority was flexibility and comfortable movement.`
    };
  }

  // 4. Art Class
  if (isArtClass) {
    return {
      icon: '🎨',
      title: "Practical Choice",
      description: `Today's priority was washable and comfortable clothing.`
    };
  }

  // 5. Picture Day
  if (isPictureDay) {
    return {
      icon: '✨',
      title: "Look Your Best",
      description: `Today's priority was creating a polished outfit while keeping ${child.name} comfortable.`
    };
  }

  // 6. Sunny / Hot
  if (weather.condition === 'sunny' || weather.temp >= 70) {
    return {
      icon: '☀️',
      title: "Stay Cool",
      description: `Today's priority was lightweight, breathable clothing.`
    };
  }

  // 7. Field Trip (from existing logic)
  if (school.activity.toLowerCase().includes('field trip')) {
    return {
      icon: '🚌',
      title: "Field Trip Ready",
      description: `Today's priority was durable, easy-to-track clothing and walking-ready footwear.`
    };
  }

  // 8. Chilly / Windy (from existing logic)
  if (weather.condition === 'windy' || weather.temp < 60) {
    return {
      icon: '💨',
      title: "Chilly Shield",
      description: `Today's priority was breeze protection and cozy layering to keep ${child.name} warm.`
    };
  }

  // Default Fallback
  return {
    icon: '🧸',
    title: "Cozy School Day",
    description: `Today's priority was balanced comfort, soft fabrics, and easy school-ready styling.`
  };
};

// Multi-agent workflow step configuration
const agentSteps = [
  { name: 'Profile Agent', icon: '👤', desc: 'Analyzes sensory dislikes and child preferences' },
  { name: 'Wardrobe Agent', icon: '🚪', desc: 'Scans available clothing stock and properties' },
  { name: 'Weather Agent', icon: '🌤️', desc: 'Evaluates forecast temperature and conditions' },
  { name: 'School Context Agent', icon: '🏫', desc: 'Checks schedule calendar and PE requirements' },
  { name: 'Stylist Agent', icon: '🪄', desc: 'Resolves constraints to select matching garments' },
  { name: 'Feedback Memory Agent', icon: '🧠', desc: 'Incorporates past parent approval ratings' }
];

// Helper to return a user-friendly status message for each step
const getStepStatusMessage = (
  idx: number,
  isGenerating: boolean,
  activeAgentStep: number,
  childName: string,
  currentFeedback: 'like' | 'dislike' | 'too_warm' | 'too_cold' | null,
  isRefining?: boolean
) => {
  switch (idx) {
    case 0:
      if (isGenerating && activeAgentStep === 0) return 'Analyzing sensory dislikes & preferences...';
      return `Loaded ${childName}’s preferences and sensory dislikes.`;
    case 1:
      if (isGenerating && activeAgentStep === 1) return 'Scanning closet stock and properties...';
      return 'Found available clothing items in the mock wardrobe.';
    case 2:
      if (isGenerating && activeAgentStep === 2) return 'Evaluating temperature and conditions...';
      return 'Checked today’s mock weather scenario.';
    case 3:
      if (isGenerating && activeAgentStep === 3) return 'Checking school calendar & event requirements...';
      return 'Detected school activity requirements.';
    case 4:
      if (isGenerating && activeAgentStep === 4) return 'Resolving constraints to select garments...';
      return 'Generated an outfit that satisfies constraints.';
    case 5:
      if (isGenerating && activeAgentStep === 5) return 'Incorporating past parent approval ratings...';
      if (isRefining) return 'Feedback received';
      if (!isGenerating && activeAgentStep === -1) {
        if (currentFeedback) {
          if (currentFeedback === 'like') return 'Preference saved';
          return 'Recommendation updated';
        }
        return 'Waiting for parent/child feedback.';
      }
      return 'Waiting for parent/child feedback.';
    default:
      return '';
  }
};

interface OutfitRecommendationProps {
  outfit: Outfit;
  child: Child;
  isGenerating: boolean;
  activeAgentStep: number;
  onGenerateNewOutfit: () => void;
  recommendationType: 'dynamic' | 'comfort' | 'weather' | 'activity' | 'style';
  onRecommendationTypeChange: (type: 'dynamic' | 'comfort' | 'weather' | 'activity' | 'style') => void;
  weather: WeatherCondition;
  school: SchoolContext;
  currentFeedback: 'like' | 'dislike' | 'too_warm' | 'too_cold' | null;
  isRefining?: boolean;
}

export const OutfitRecommendation: React.FC<OutfitRecommendationProps> = ({
  outfit,
  child,
  isGenerating,
  onGenerateNewOutfit,
  recommendationType,
  onRecommendationTypeChange,
  isRefining = false
}) => {
  // Helper to map color names to hex codes for the SVG drawings (kept as high-quality fallback)
  const getColorHex = (colorName: string): string => {
    const map: Record<string, string> = {
      'Violet': '#c084fc',
      'Pink': '#f472b6',
      'Pastel Pink': '#fbcfe8',
      'Royal Blue': '#2563eb',
      'Sky Blue': '#38bdf8',
      'Teal': '#2dd4bf',
      'Navy Blue': '#1e3a8a',
      'Navy': '#1e293b',
      'Black': '#18181b',
      'Black/Teal': '#115e59',
      'White': '#ffffff',
      'White/Pink': '#fce7f3',
      'Denim': '#475569',
      'Gold/Pink': '#fcd34d',
      'Blue': '#3b82f6',
      'Neon Pink': '#f43f5e',
      'Lavender': '#e9d5ff',
      'Purple': '#a855f7',
      'Pink/Silver': '#fda4af',
      'Neon Green': '#22c55e',
      'Navy/Yellow': '#0f172a',
      'Yellow': '#eab308'
    };
    return map[colorName] || '#94a3b8'; // default gray
  };

  const renderItemSvg = (category: string, colorName: string, id: string) => {
    const hex = getColorHex(colorName);
    const strokeColor = 'var(--text-primary)';
    
    switch (category) {
      case 'top':
        return (
          <svg viewBox="0 0 100 100" width="60" height="60">
            <path 
              d="M 20,28 L 36,16 C 39,18, 43,20, 50,20 C 57,20, 61,18, 64,16 L 80,28 L 72,40 L 66,35 L 66,84 L 34,84 L 34,35 L 28,40 Z" 
              fill={hex} 
              stroke={strokeColor} 
              strokeWidth="3" 
              strokeLinejoin="round" 
            />
            {id === 'm_top_soccer' && (
              <>
                <path d="M 46,20 L 46,84" stroke="#ffffff" strokeWidth="6" />
                <circle cx="50" cy="50" r="10" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
                <path d="M 46,50 L 54,50" stroke="#ffffff" strokeWidth="2" />
              </>
            )}
            {id === 'e_top_unicorn' && (
              <text x="40" y="58" fontSize="20" style={{ userSelect: 'none' }}>🦄</text>
            )}
            {id.includes('spirit') && (
              <circle cx="50" cy="52" r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            )}
          </svg>
        );
      case 'bottom':
        const isSkirt = id === 'e_bot_skirt';
        const isShorts = id.includes('shorts');
        
        if (isSkirt) {
          return (
            <svg viewBox="0 0 100 100" width="60" height="60">
              <path 
                d="M 35,20 L 65,20 L 85,76 L 15,76 Z" 
                fill={hex} 
                stroke={strokeColor} 
                strokeWidth="3" 
                strokeLinejoin="round" 
              />
              <circle cx="35" cy="50" r="3" fill="#fef08a" />
              <circle cx="50" cy="40" r="3.5" fill="#fef08a" />
              <circle cx="65" cy="52" r="3" fill="#fef08a" />
              <circle cx="50" cy="65" r="4" fill="#fef08a" />
            </svg>
          );
        }
        
        if (isShorts) {
          return (
            <svg viewBox="0 0 100 100" width="60" height="60">
              <path 
                d="M 30,15 L 70,15 L 76,60 L 52,60 L 50,35 L 48,60 L 24,60 Z" 
                fill={hex} 
                stroke={strokeColor} 
                strokeWidth="3" 
                strokeLinejoin="round" 
              />
              <line x1="30" y1="26" x2="70" y2="26" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
            </svg>
          );
        }

        return (
          <svg viewBox="0 0 100 100" width="60" height="60">
            <path 
              d="M 32,15 L 68,15 L 74,85 L 53,85 L 50,38 L 47,85 L 26,85 Z" 
              fill={hex} 
              stroke={strokeColor} 
              strokeWidth="3" 
              strokeLinejoin="round" 
            />
          </svg>
        );
      case 'shoes':
        const isBoots = id.includes('boots');
        if (isBoots) {
          return (
            <svg viewBox="0 0 100 100" width="60" height="60">
              <path 
                d="M 30,20 L 55,20 L 55,55 L 85,60 L 85,82 L 20,82 L 20,50 Z" 
                fill={hex} 
                stroke={strokeColor} 
                strokeWidth="3" 
                strokeLinejoin="round" 
              />
              <rect x="18" y="82" width="69" height="5" rx="2" fill="#475569" />
              <rect x="26" y="15" width="33" height="8" rx="4" fill="#f8fafc" stroke={strokeColor} strokeWidth="2" />
            </svg>
          );
        }
        return (
          <svg viewBox="0 0 100 100" width="60" height="60">
            <path 
              d="M 15,65 L 35,32 L 55,32 L 85,58 L 90,78 L 15,78 Z" 
              fill={hex} 
              stroke={strokeColor} 
              strokeWidth="3" 
              strokeLinejoin="round" 
            />
            <path d="M 12,78 L 90,78 L 88,84 L 14,84 Z" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
            <line x1="38" y1="42" x2="48" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="43" y1="38" x2="53" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'outerwear':
        return (
          <svg viewBox="0 0 100 100" width="60" height="60">
            <path 
              d="M 22,30 L 35,16 C 35,16, 38,8, 50,8 C 62,8, 65,16, 65,16 L 78,30 L 70,44 L 64,38 L 64,84 L 36,84 L 36,38 L 30,44 Z" 
              fill={hex} 
              stroke={strokeColor} 
              strokeWidth="3" 
              strokeLinejoin="round" 
            />
            <line x1="50" y1="20" x2="50" y2="84" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="24" r="4" fill="#fda4af" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );
      case 'accessory':
        const isHeadband = id.includes('headband');
        if (isHeadband) {
          return (
            <svg viewBox="0 0 100 100" width="60" height="60">
              <path 
                d="M 20,65 A 32,32 0 0,1 80,65" 
                fill="none" 
                stroke={hex} 
                strokeWidth="6" 
                strokeLinecap="round" 
              />
              <polygon 
                points="50,12 40,36 60,36" 
                fill="#fbbf24" 
                stroke={strokeColor} 
                strokeWidth="2" 
                strokeLinejoin="round" 
              />
              <line x1="43" y1="30" x2="57" y2="28" stroke={strokeColor} strokeWidth="1.5" />
              <line x1="46" y1="20" x2="54" y2="18" stroke={strokeColor} strokeWidth="1.5" />
              <circle cx="38" cy="42" r="6" fill="#f472b6" />
              <circle cx="62" cy="42" r="6" fill="#c084fc" />
            </svg>
          );
        }
        return (
          <svg viewBox="0 0 100 100" width="60" height="60">
            <rect 
              x="18" 
              y="38" 
              width="64" 
              height="24" 
              rx="6" 
              fill={hex} 
              stroke={strokeColor} 
              strokeWidth="3" 
            />
            <circle cx="50" cy="50" r="8" fill="#ffffff" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M 45,46 A 6,6 0 0,0 45,54" fill="none" stroke={strokeColor} strokeWidth="1" />
            <path d="M 55,46 A 6,6 0 0,1 55,54" fill="none" stroke={strokeColor} strokeWidth="1" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-card" id="outfit-recommendation-card" style={{ gap: '1.5rem' }}>
      {/* Local style block for custom animations */}
      <style>{`
        @keyframes localSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes localPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes activeGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.15); }
        }
        .animate-local-spin {
          animation: localSpin 0.8s linear infinite;
        }
        .animate-local-pulse {
          animation: localPulse 1.5s infinite ease-in-out;
        }
        .active-glow {
          animation: activeGlow 1.5s infinite ease-in-out;
        }
        .refine-transition {
          transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        .refining-fade {
          opacity: 0.15;
          filter: blur(3px);
          transform: scale(0.98);
        }
      `}</style>

      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: 'var(--font-family-playful)', fontSize: '1.6rem', color: 'var(--text-primary)', margin: 0 }}>
            👗 Today's Recommendation
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Curated styling matching weather, schedule, & sensory comfort
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Generate New Outfit Button */}
          <button 
            className="btn"
            onClick={onGenerateNewOutfit}
            disabled={isGenerating}
            style={{
              background: child.id === 'emma' ? 'var(--emma-gradient)' : 'var(--mia-gradient)',
              border: 'none',
              borderRadius: '2rem',
              fontSize: '0.85rem',
              color: 'white',
              padding: '0.5rem 1.25rem',
              boxShadow: 'var(--shadow-sm)',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontWeight: 700
            }}
          >
            {isGenerating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span 
                  className="animate-local-spin"
                  style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    border: '2px solid white', 
                    borderTopColor: 'transparent', 
                    borderRadius: '50%' 
                  }}
                ></span>
                <span>Thinking...</span>
              </div>
            ) : (
              <span>✨ Generate New Outfit</span>
            )}
          </button>

          {/* Score indicator */}
          <div 
            className="refine-transition"
            style={{ 
              background: child.id === 'emma' ? 'var(--emma-light)' : 'var(--mia-light)',
              color: child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)',
              padding: '0.4rem 0.8rem', 
              borderRadius: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)',
              border: `1px solid ${child.id === 'emma' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(14, 165, 233, 0.2)'}`,
              opacity: isRefining ? 0.15 : 1,
              filter: isRefining ? 'blur(1px)' : 'none',
              transform: isRefining ? 'scale(0.93)' : 'scale(1)'
            }}
          >
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>Match Score</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{outfit.suitabilityScore}%</span>
          </div>
        </div>
      </div>

      {/* Pre-Curated Collections Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Aura's Curated Collections
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
          {([
            { key: 'dynamic', label: 'Dynamic AI', icon: '🪄' },
            { key: 'comfort', label: 'Comfort', icon: '🛋️' },
            { key: 'weather', label: 'Weather', icon: '🌦️' },
            { key: 'activity', label: 'Activity', icon: '🏫' },
            { key: 'style', label: 'Style', icon: '🎨' }
          ] as const).map(tab => {
            const isActive = recommendationType === tab.key;
            let activeBg = 'rgba(15, 23, 42, 0.05)';
            let activeBorder = '1px solid var(--border-color)';
            
            if (isActive) {
              activeBg = child.id === 'emma' ? 'var(--emma-light)' : 'var(--mia-light)';
              activeBorder = `2px solid ${child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)'}`;
            }

            return (
              <button
                key={tab.key}
                onClick={() => onRecommendationTypeChange(tab.key)}
                disabled={isGenerating}
                style={{
                  background: isActive ? activeBg : 'var(--bg-page)',
                  border: isActive ? activeBorder : '1px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  padding: '0.5rem 0.25rem',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-family-playful)'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Loading State OR Outfit Grid */}
      {isGenerating ? (
        <div 
          className="animate-local-pulse"
          style={{ 
            height: '240px', 
            background: 'var(--bg-page)', 
            borderRadius: '1rem', 
            border: '1px solid var(--border-color)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: 'inset var(--shadow-sm)'
          }}
        >
          <div style={{ fontSize: '3rem' }}>🧙‍♂️✨</div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-family-playful)', fontSize: '1.2rem' }}>
            Aura's styling agents are thinking...
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '350px' }}>
            Simulating multi-agent constraints solver to formulate a safe, comfy, and stylish recommendation.
          </div>
        </div>
      ) : (
        /* Outfit Grid */
        <div 
          className={`grid-cols-2 refine-transition ${isRefining ? 'refining-fade' : ''}`} 
          style={{ 
            gap: '1rem',
            gridTemplateColumns: outfit.outerwear || outfit.accessory 
              ? 'repeat(auto-fit, minmax(130px, 1fr))' 
              : `repeat(${outfit.top ? 3 : 2}, 1fr)`
          }}
        >
          {/* TOP */}
          {outfit.top && (
            <div 
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span className="badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{outfit.top.category.toUpperCase()}</span>
              <div className="outfit-drawing" style={{ position: 'relative', width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '0.75rem' }}>
                {outfit.top.image ? (
                  <img 
                    src={outfit.top.image} 
                    alt={outfit.top.name} 
                    onError={(e) => {
                      if (outfit.top?.fallbackSvg) {
                        e.currentTarget.src = outfit.top.fallbackSvg;
                      }
                    }}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }} 
                  />
                ) : (
                  renderItemSvg('top', outfit.top.color, outfit.top.id)
                )}
              </div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', height: '2.25rem', overflow: 'hidden', marginTop: '0.5rem' }}>
                {outfit.top.name}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {outfit.top.color}
              </span>
            </div>
          )}

          {/* BOTTOM */}
          <div 
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '1rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span className="badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {outfit.bottom.category.toUpperCase()}
            </span>
            <div className="outfit-drawing" style={{ position: 'relative', width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '0.75rem' }}>
              {outfit.bottom.image ? (
                <img 
                  src={outfit.bottom.image} 
                  alt={outfit.bottom.name} 
                  onError={(e) => {
                    if (outfit.bottom.fallbackSvg) {
                      e.currentTarget.src = outfit.bottom.fallbackSvg;
                    }
                  }}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }} 
                />
              ) : (
                renderItemSvg('bottom', outfit.bottom.color, outfit.bottom.id)
              )}
            </div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', height: '2.25rem', overflow: 'hidden', marginTop: '0.5rem' }}>
              {outfit.bottom.name}
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {outfit.bottom.color}
            </span>
          </div>

          {/* SHOES */}
          <div 
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '1rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span className="badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{outfit.shoes.category.toUpperCase()}</span>
            <div className="outfit-drawing" style={{ position: 'relative', width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '0.75rem' }}>
              {outfit.shoes.image ? (
                <img 
                  src={outfit.shoes.image} 
                  alt={outfit.shoes.name} 
                  onError={(e) => {
                    if (outfit.shoes.fallbackSvg) {
                      e.currentTarget.src = outfit.shoes.fallbackSvg;
                    }
                  }}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }} 
                />
              ) : (
                renderItemSvg('shoes', outfit.shoes.color, outfit.shoes.id)
              )}
            </div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', height: '2.25rem', overflow: 'hidden', marginTop: '0.5rem' }}>
              {outfit.shoes.name}
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {outfit.shoes.color}
            </span>
          </div>

          {/* OUTERWEAR (Conditional) */}
          {outfit.outerwear && (
            <div 
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span className="badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{outfit.outerwear.category.toUpperCase()}</span>
              <div className="outfit-drawing" style={{ position: 'relative', width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '0.75rem' }}>
                {outfit.outerwear.image ? (
                  <img 
                    src={outfit.outerwear.image} 
                    alt={outfit.outerwear.name} 
                    onError={(e) => {
                      if (outfit.outerwear?.fallbackSvg) {
                        e.currentTarget.src = outfit.outerwear.fallbackSvg;
                      }
                    }}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }} 
                  />
                ) : (
                  renderItemSvg('outerwear', outfit.outerwear.color, outfit.outerwear.id)
                )}
              </div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', height: '2.25rem', overflow: 'hidden', marginTop: '0.5rem' }}>
                {outfit.outerwear.name}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {outfit.outerwear.color}
              </span>
            </div>
          )}

          {/* ACCESSORY (Conditional) */}
          {outfit.accessory && (
            <div 
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span className="badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{outfit.accessory.category.toUpperCase()}</span>
              <div className="outfit-drawing" style={{ position: 'relative', width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '0.75rem' }}>
                {outfit.accessory.image ? (
                  <img 
                    src={outfit.accessory.image} 
                    alt={outfit.accessory.name} 
                    onError={(e) => {
                      if (outfit.accessory?.fallbackSvg) {
                        e.currentTarget.src = outfit.accessory.fallbackSvg;
                      }
                    }}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }} 
                  />
                ) : (
                  renderItemSvg('accessory', outfit.accessory.color, outfit.accessory.id)
                )}
              </div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', height: '2.25rem', overflow: 'hidden', marginTop: '0.5rem' }}>
                {outfit.accessory.name}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {outfit.accessory.color}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface WhyThisOutfitCardProps {
  outfit: Outfit;
  child: Child;
  weather: WeatherCondition;
  school: SchoolContext;
  currentFeedback: 'like' | 'dislike' | 'too_warm' | 'too_cold' | null;
  isRefining?: boolean;
  validationResult?: any;
}

export const WhyThisOutfitCard: React.FC<WhyThisOutfitCardProps> = ({
  outfit,
  child,
  weather,
  school,
  currentFeedback,
  isRefining = false,
  validationResult
}) => {
  const focus = getAuraFocus(outfit, school, weather, child, currentFeedback);

  const failedAgents = validationResult?.failedAgents || [];
  const isWeatherFailed = failedAgents.includes('weather');
  const isSchoolFailed = failedAgents.includes('school');
  const isProfileFailed = failedAgents.includes('profile');

  const isGreatMatch = validationResult ? (validationResult.isValid && validationResult.severity === 'info') : true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', height: '100%' }}>
      {/* Card: Why this outfit? */}
      <div 
        className="refine-transition"
        style={{ 
          background: 'rgba(248, 250, 252, 0.5)', 
          borderRadius: '1rem', 
          padding: '1.25rem', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          opacity: isRefining ? 0.15 : 1,
          filter: isRefining ? 'blur(2px)' : 'none',
          transform: isRefining ? 'scale(0.98)' : 'scale(1)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-playful)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
            💡 Why this outfit?
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: child.id === 'emma' ? 'rgba(236, 72, 153, 0.08)' : 'rgba(14, 165, 233, 0.08)', color: child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)', borderRadius: '2rem', border: `1px solid ${child.id === 'emma' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(14, 165, 233, 0.15)'}`, fontWeight: 700, fontSize: '0.75rem' }}>
              <span>💜</span> Favorite Colors
            </div>
            
            {isWeatherFailed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '2rem', border: '1px solid rgba(239, 68, 68, 0.15)', fontWeight: 700, fontSize: '0.75rem' }}>
                <span>⚠️</span> Weather Warning
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)', borderRadius: '2rem', border: '1px solid rgba(16, 185, 129, 0.15)', fontWeight: 700, fontSize: '0.75rem' }}>
                <span>✔</span> Weather Ready
              </div>
            )}

            {isSchoolFailed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(245, 158, 11, 0.08)', color: '#d97706', borderRadius: '2rem', border: '1px solid rgba(245, 158, 11, 0.15)', fontWeight: 700, fontSize: '0.75rem' }}>
                <span>⚠️</span> Activity Warning
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--color-info)', borderRadius: '2rem', border: '1px solid rgba(59, 130, 246, 0.15)', fontWeight: 700, fontSize: '0.75rem' }}>
                <span>🏫</span> School Ready
              </div>
            )}

            {isProfileFailed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '2rem', border: '1px solid rgba(239, 68, 68, 0.15)', fontWeight: 700, fontSize: '0.75rem' }}>
                <span>⚠️</span> Sensory Dislike
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', borderRadius: '2rem', border: '1px solid rgba(168, 85, 247, 0.15)', fontWeight: 700, fontSize: '0.75rem' }}>
                <span>🧸</span> Sensory Safe
              </div>
            )}

            {isGreatMatch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(234, 179, 8, 0.08)', color: '#ca8a04', borderRadius: '2rem', border: '1px solid rgba(234, 179, 8, 0.15)', fontWeight: 700, fontSize: '0.75rem' }}>
                <span>✨</span> Great Match
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.5rem 0 0 0', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
          Chosen to keep {child.name} comfortable and ready for today.
        </p>
      </div>

      {/* Card: Aura's Focus Today */}
      <div 
        id="stylist-notes-bubble"
        className="refine-transition"
        style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
          borderRadius: '1.25rem',
          padding: '1rem 1.25rem',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderLeft: '6px solid #a855f7',
          boxShadow: '0 8px 24px -6px rgba(168, 85, 247, 0.16)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          flexGrow: 1,
          opacity: isRefining ? 0.15 : 1,
          filter: isRefining ? 'blur(2px)' : 'none',
          transform: isRefining ? 'scale(0.98)' : 'scale(1)'
        }}
      >
        {/* Playful background decorative blur */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '90px',
          height: '90px',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '50%',
          filter: 'blur(15px)',
          pointerEvents: 'none'
        }} />

        {/* Icon Container (Representing Aura the Assistant) */}
        <div 
          style={{ 
            fontSize: '1.8rem', 
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', 
            borderRadius: '50%',
            width: '3.2rem',
            height: '3.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
            flexShrink: 0,
            color: 'white'
          }}
        >
          🤖
        </div>

        {/* Text Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem', zIndex: 1 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🤖 Aura's Focus Today
          </span>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-playful)', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{focus.icon}</span> {focus.title}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
            {focus.description}
          </p>
        </div>
      </div>
    </div>
  );
};

interface AgentWorkflowCardProps {
  child: Child;
  isGenerating: boolean;
  activeAgentStep: number;
  currentFeedback: 'like' | 'dislike' | 'too_warm' | 'too_cold' | null;
  isRefining?: boolean;
  highlightedAgents?: string[];
}

export const AgentWorkflowCard: React.FC<AgentWorkflowCardProps> = ({
  child,
  isGenerating,
  activeAgentStep,
  currentFeedback,
  isRefining = false,
  highlightedAgents = []
}) => {
  const getStepStatusMessageLocal = (
    idx: number,
    agentId: string,
    isHighlighted: boolean
  ) => {
    if (isGenerating) {
      if (activeAgentStep === idx) {
        if (isHighlighted) {
          if (agentId === 'weather') return '🌦️ Weather Agent: Recalibrating layers for the new forecast...';
          if (agentId === 'school') return '🏫 School Agent: Enforcing dress code and gym requirements...';
          if (agentId === 'feedback') return '🧠 Feedback Agent: Recalling sensory dislikes and past ratings...';
          if (agentId === 'stylist') return '🪄 Stylist Agent: Assembling a fully validated, conflict-free outfit...';
        }
        return getStepStatusMessage(idx, isGenerating, activeAgentStep, child.name, currentFeedback, isRefining);
      }
      return idx < activeAgentStep ? 'Step completed.' : 'Waiting to execute...';
    }

    // Not generating
    if (isHighlighted) {
      if (agentId === 'weather') return '🌦️ Weather Agent: Successfully adapted outfit for weather protection.';
      if (agentId === 'school') return '🏫 School Agent: Verified compliance with school activities.';
      if (agentId === 'feedback') return '🧠 Feedback Agent: Avoided sensory dislikes and respected past ratings.';
      if (agentId === 'stylist') return '🪄 Stylist Agent: Resolved styling conflicts to curate a fresh outfit.';
    }

    return getStepStatusMessage(idx, isGenerating, activeAgentStep, child.name, currentFeedback, isRefining);
  };

  return (
    <div 
      style={{ 
        background: 'rgba(248, 250, 252, 0.5)', 
        borderRadius: '1rem', 
        padding: '1.25rem', 
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%'
      }}
    >
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-playful)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
        🤖 Agent Workflow & Reasoning
      </h3>

      {/* Steps timeline (Vertical connected flow) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
        {agentSteps.map((step, idx) => {
          const agentId = ['profile', 'wardrobe', 'weather', 'school', 'stylist', 'feedback'][idx];
          const isHighlighted = highlightedAgents.includes(agentId);

          const isActive = (isGenerating && activeAgentStep === idx) || 
                           (!isGenerating && activeAgentStep === -1 && idx === 5 && !currentFeedback && isRefining) ||
                           (idx === 5 && isRefining);
          const isCompleted = idx < 5 
            ? (!isGenerating && activeAgentStep === -1) || (isGenerating && activeAgentStep > idx)
            : (!isGenerating && activeAgentStep === -1 && !!currentFeedback && !isRefining);
          const isPending = !isActive && !isCompleted;

          // Node styling based on state
          let nodeBg = 'var(--bg-page)';
          let nodeBorder = '2px solid var(--border-color)';
          let nodeColor = 'var(--text-muted)';
          let nodeGlowClass = '';
          
          if (isActive) {
            nodeBg = child.id === 'emma' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(14, 165, 233, 0.1)';
            nodeBorder = `2px solid ${child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)'}`;
            nodeColor = child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)';
            nodeGlowClass = 'active-glow';
          } else if (isHighlighted) {
            nodeBg = 'rgba(245, 158, 11, 0.12)';
            nodeBorder = '2px solid #f59e0b';
            nodeColor = '#d97706';
            nodeGlowClass = 'active-glow';
          } else if (isCompleted) {
            nodeBg = 'rgba(16, 185, 129, 0.1)';
            nodeBorder = '2px solid var(--color-success)';
            nodeColor = 'var(--color-success)';
          }

          // Connector line color
          let lineColor = 'var(--border-color)';
          if (isCompleted) {
            lineColor = 'var(--color-success)';
          } else if (isActive) {
            lineColor = child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)';
          } else if (isHighlighted) {
            lineColor = '#f59e0b';
          }

          return (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                position: 'relative',
                opacity: isPending && !isHighlighted ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Left Column: Node and Connector Line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div 
                  className={nodeGlowClass}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: nodeBg,
                    border: nodeBorder,
                    color: nodeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    zIndex: 2,
                    transition: 'all 0.3s ease',
                    boxShadow: isActive 
                      ? (child.id === 'emma' ? '0 0 10px rgba(236, 72, 153, 0.3)' : '0 0 10px rgba(14, 165, 233, 0.3)') 
                      : isHighlighted 
                        ? '0 0 10px rgba(245, 158, 11, 0.4)' 
                        : 'none'
                  }}
                >
                  {step.icon}
                </div>
                
                {idx < agentSteps.length - 1 && (
                  <div 
                    style={{
                      width: '3px',
                      flexGrow: 1,
                      minHeight: '1.25rem',
                      background: lineColor,
                      zIndex: 1,
                      borderRadius: '2px',
                      transition: 'background-color 0.3s ease',
                      margin: '2px 0'
                    }} 
                  />
                )}
              </div>

              {/* Right Column: Text Details & Checkmark */}
              <div 
                style={{ 
                  flex: 1, 
                  paddingBottom: idx < agentSteps.length - 1 ? '1rem' : '0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '0.15rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 
                    style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 700, 
                      color: isActive ? 'var(--text-primary)' : isHighlighted ? '#d97706' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontFamily: 'var(--font-family-sans)'
                    }}
                  >
                    {step.name}
                    {isActive && (
                      <span 
                        style={{ 
                          display: 'inline-block', 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)',
                          animation: 'localPulse 1s infinite'
                        }} 
                      />
                    )}
                    {isHighlighted && !isGenerating && (
                      <span className="badge" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '0.25rem', fontWeight: 800 }}>
                        Resolved Conflict
                      </span>
                    )}
                  </h4>
                  
                  {/* Status Indicator Badge */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isCompleted && (
                      <span 
                        style={{ 
                          color: 'var(--color-success)', 
                          fontWeight: 'bold', 
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '50%',
                          width: '1.25rem',
                          height: '1.25rem',
                          justifyContent: 'center'
                        }}
                      >
                        ✓
                      </span>
                    )}
                    {isActive && (
                      <div 
                        className="animate-local-spin"
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          border: `2px solid ${child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)'}`, 
                          borderTopColor: 'transparent', 
                          borderRadius: '50%' 
                        }}
                      />
                    )}
                    {isHighlighted && !isGenerating && !isCompleted && (
                      <span 
                        style={{ 
                          color: '#d97706', 
                          fontWeight: 'bold', 
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderRadius: '50%',
                          width: '1.25rem',
                          height: '1.25rem',
                          justifyContent: 'center'
                        }}
                      >
                        ⚡
                      </span>
                    )}
                    {isPending && !isHighlighted && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-color)' }} />
                    )}
                  </div>
                </div>
                
                <p 
                  style={{ 
                    fontSize: '0.78rem', 
                    color: isActive ? (child.id === 'emma' ? 'var(--emma-primary)' : 'var(--mia-primary)') : isHighlighted ? '#b45309' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)',
                    margin: 0,
                    lineHeight: '1.3'
                  }}
                >
                  {getStepStatusMessageLocal(idx, agentId, isHighlighted)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
