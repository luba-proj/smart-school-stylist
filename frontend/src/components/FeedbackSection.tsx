import React from 'react';

interface FeedbackSectionProps {
  onFeedback: (rating: 'like' | 'dislike' | 'too_warm' | 'too_cold') => void;
  lastFeedback: 'like' | 'dislike' | 'too_warm' | 'too_cold' | null;
  childName: string;
  hasMemory: boolean;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  onFeedback,
  lastFeedback,
  childName,
  hasMemory
}) => {
  const options = [
    {
      type: 'like' as const,
      label: 'Like It!',
      emoji: '❤️',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      activeColor: '#ec4899'
    },
    {
      type: 'dislike' as const,
      label: 'Dislike',
      emoji: '👎',
      color: '#64748b',
      bgColor: 'rgba(100, 116, 139, 0.1)',
      activeColor: '#475569'
    },
    {
      type: 'too_warm' as const,
      label: 'Too Warm',
      emoji: '🌡️',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      activeColor: '#ea580c'
    },
    {
      type: 'too_cold' as const,
      label: 'Too Chilly',
      emoji: '❄️',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      activeColor: '#2563eb'
    }
  ];

  return (
    <div className="glass-card" id="feedback-section-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-family-playful)', fontSize: '1.25rem', margin: 0 }}>
          💬 Outfit Feedback
        </h3>
        {hasMemory && (
          <span style={{
            fontSize: '0.75rem',
            background: 'rgba(124, 58, 237, 0.1)',
            color: '#7c3aed',
            padding: '0.25rem 0.6rem',
            borderRadius: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            🧠 Aura is learning from your feedback
          </span>
        )}
      </div>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.25rem', marginBottom: '0.75rem', fontWeight: 600, display: 'block' }}>
        How did this outfit feel today? Your feedback tunes the AI stylist.
      </span>

      <div className="grid-cols-4" style={{ gap: '0.75rem' }}>
        {options.map((opt) => {
          const isActive = lastFeedback === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => onFeedback(opt.type)}
              className="btn"
              style={{
                background: isActive ? opt.activeColor : 'var(--bg-page)',
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                border: `2px solid ${isActive ? opt.activeColor : 'var(--border-color)'}`,
                padding: '0.75rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                borderRadius: '1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: isActive ? `0 4px 12px ${opt.bgColor}` : 'var(--shadow-sm)',
                transform: isActive ? 'scale(1.03)' : 'none'
              }}
            >
              <span 
                style={{ 
                  fontSize: '1.75rem', 
                  animation: isActive ? 'pulseEmoji 0.6s infinite alternate' : 'none' 
                }}
              >
                {opt.emoji}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {lastFeedback && (
        <div 
          style={{ 
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: '#059669',
            fontWeight: 600,
            textAlign: 'center',
            animation: 'slideIn 0.2s ease-out',
            marginTop: '1rem'
          }}
        >
          {lastFeedback === 'like' && `✨ Aura learned that ${childName} liked this outfit. Colors & tags preference boosted!`}
          {lastFeedback === 'dislike' && `✨ Aura learned that ${childName} disliked this outfit. This exact combination will be avoided.`}
          {lastFeedback === 'too_warm' && `✨ Aura will avoid outfits that feel too warm for ${childName}. Lighter clothing preferred.`}
          {lastFeedback === 'too_cold' && `✨ Aura will choose warmer layers next time for ${childName}. Warmer clothing preferred.`}
        </div>
      )}

      <style>{`
        @keyframes pulseEmoji {
          0% { transform: scale(1); }
          100% { transform: scale(1.2) rotate(5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
