import React from 'react';
import type { Child } from '../types';

interface ChildSelectorProps {
  children: Child[];
  selectedChild: Child;
  onSelect: (child: Child) => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  selectedChild,
  onSelect
}) => {
  return (
    <div className="glass-card" id="child-selector-card">
      <h3 style={{ fontFamily: 'var(--font-family-playful)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        👧 Children Profiles
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children.map(child => {
          const isActive = child.id === selectedChild.id;
          const borderStyle = isActive 
            ? `2px solid ${child.avatarColor}`
            : '2px solid transparent';
          
          return (
            <div
              key={child.id}
              onClick={() => onSelect(child)}
              className={`avatar-container ${child.id} ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '1rem',
                cursor: 'pointer',
                background: isActive ? 'var(--bg-page)' : 'rgba(255,255,255,0.03)',
                border: borderStyle,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <div 
                className="avatar-circle"
                style={{
                  background: child.themeGradient,
                  color: 'white',
                  width: '3.5rem',
                  height: '3.5rem',
                  fontSize: '1.75rem'
                }}
              >
                {child.id === 'emma' ? '🌸' : '⚽'}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {child.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Age {child.age}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {child.preferences.slice(0, 2).map((pref, idx) => (
                    <span 
                      key={idx} 
                      className="badge" 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: isActive ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
};
