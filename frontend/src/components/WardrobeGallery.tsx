import React, { useState } from 'react';
import type { WardrobeItem, Child } from '../types';

interface WardrobeGalleryProps {
  items: WardrobeItem[];
  child: Child;
}

type CategoryFilter = 'all' | 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory';

export const WardrobeGallery: React.FC<WardrobeGalleryProps> = ({
  items,
  child
}) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');

  const categories: { value: CategoryFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All Closet', icon: '🚪' },
    { value: 'top', label: 'Tops', icon: '👕' },
    { value: 'bottom', label: 'Bottoms', icon: '👖' },
    { value: 'outerwear', label: 'Jackets', icon: '🧥' },
    { value: 'shoes', label: 'Shoes', icon: '👟' },
    { value: 'accessory', label: 'Extras', icon: '👑' }
  ];

  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter(item => {
        if (activeFilter === 'bottom') {
          return item.category === 'bottom' || item.category === 'dress';
        }
        return item.category === activeFilter;
      });

  // Render warmth flames
  const renderWarmthRating = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <span 
        key={idx} 
        style={{ 
          color: idx < rating ? '#f97316' : '#cbd5e1',
          fontSize: '0.85rem'
        }}
      >
        🔥
      </span>
    ));
  };

  return (
    <div className="glass-card" id="wardrobe-gallery-card">
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-family-playful)', fontSize: '1.4rem' }}>
            🚪 {child.name}'s Wardrobe Gallery
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Browse and filter available items in {child.name}'s closet
          </span>
        </div>

        {/* Category Filters */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '0.35rem', 
            background: 'var(--bg-page)', 
            padding: '0.25rem', 
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}
        >
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              style={{
                background: activeFilter === cat.value ? 'var(--bg-card)' : 'transparent',
                color: activeFilter === cat.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: activeFilter === cat.value ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of clothes */}
      <div className="wardrobe-grid">
        {filteredItems.map(item => {
          const isDisliked = item.tags.some(tag => 
            child.sensoryDislikes.some(dis => dis.toLowerCase() === tag.toLowerCase())
          );
          
          return (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-page)',
                border: isDisliked ? '1.5px dashed #ef4444' : '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
                opacity: isDisliked ? 0.75 : 1
              }}
            >
              {/* Emojis & Favorites Header */}
              <div className="flex-between">
                {item.isFavorite ? (
                  <span className="badge badge-favorite">❤️ Fav</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                )}
                {isDisliked && (
                  <span className="badge" style={{ background: '#fef2f2', color: '#ef4444', fontSize: '0.65rem' }}>
                    ⚠️ Sensory Avoid
                  </span>
                )}
              </div>

              {/* Clothing Photo Box */}
              <div 
                style={{ 
                  height: '110px', 
                  background: 'var(--bg-card)', 
                  borderRadius: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    onError={(e) => {
                      if (item.fallbackSvg) {
                        e.currentTarget.src = item.fallbackSvg;
                      }
                    }}
                    style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '0.4rem' }} 
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>{item.emoji}</span>
                )}
                
                {/* Floating decorative emoji badge */}
                <span 
                  style={{ 
                    position: 'absolute', 
                    bottom: '4px', 
                    right: '4px', 
                    background: 'var(--bg-page)', 
                    borderRadius: '50%', 
                    width: '1.5rem', 
                    height: '1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.85rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {item.emoji}
                </span>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', minHeight: '2.25rem', lineHeight: '1.3' }}>
                  {item.name}
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Color: {item.color}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Warmth:</span>
                  <div style={{ display: 'inline-flex' }}>{renderWarmthRating(item.warmRating)}</div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                {item.tags.map((tag, idx) => {
                  const isDislikeTag = child.sensoryDislikes.some(dis => dis.toLowerCase() === tag.toLowerCase());
                  return (
                    <span 
                      key={idx} 
                      className="badge" 
                      style={{ 
                        fontSize: '0.65rem',
                        background: isDislikeTag ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.03)',
                        color: isDislikeTag ? '#dc2626' : 'var(--text-secondary)',
                        fontWeight: 600
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            color: 'var(--text-muted)',
            fontWeight: 600
          }}
        >
          No wardrobe items found in this category.
        </div>
      )}
    </div>
  );
};
