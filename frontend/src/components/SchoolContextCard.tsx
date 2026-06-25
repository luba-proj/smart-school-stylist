import React from 'react';
import type { SchoolContext } from '../types';

interface SchoolContextCardProps {
  school: SchoolContext;
  currentScenario: string;
  onScenarioChange: (scenario: string) => void;
}

export const SchoolContextCard: React.FC<SchoolContextCardProps> = ({
  school,
  currentScenario,
  onScenarioChange
}) => {
  return (
    <div className="glass-card" id="school-context-card">
      <div className="flex-between">
        <h3 style={{ fontFamily: 'var(--font-family-playful)', fontSize: '1.25rem' }}>
          🏫 School Schedule
        </h3>
        {/* Scenario Toggle */}
        <select
          value={currentScenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="regular">🏫 Regular Day</option>
          <option value="pe">🏃‍♂️ PE / Gym Day</option>
          <option value="art">🎨 Art Class Day</option>
          <option value="fieldtrip">🚌 Field Trip Day</option>
          <option value="picture">📸 Picture Day</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div 
          style={{ 
            fontSize: '2.5rem', 
            background: 'rgba(0,0,0,0.02)', 
            padding: '0.75rem', 
            borderRadius: '1rem',
            width: '4.5rem',
            height: '4.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {school.icon}
        </div>
        
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {school.activity}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Dress Code Constraints
          </div>
        </div>
      </div>

      <div 
        style={{ 
          background: 'rgba(16, 185, 129, 0.08)', 
          border: '1px solid rgba(16, 185, 129, 0.15)',
          padding: '1rem', 
          borderRadius: '0.75rem', 
          fontSize: '0.9rem', 
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}
      >
        <strong style={{ color: '#059669' }}>Activity Rule: </strong> 
        {school.specialRequirement}
      </div>

      {school.isPEDay && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>
            👟 Sneakers Mandatory
          </span>
          <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
            👖 Stretchy Pants Recommended
          </span>
        </div>
      )}

      {school.activity.includes('Art') && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' }}>
            👕 Dark Colors Preferred
          </span>
          <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>
            🚫 Avoid New/White Clothes
          </span>
        </div>
      )}

      {school.activity.includes('Field Trip') && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
            👕 Spirit Shirt Required
          </span>
          <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>
            👟 Closed-Toe Walking Shoes
          </span>
        </div>
      )}

      {school.activity.toLowerCase().includes('picture') && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
            📸 Dressy Attire Recommended
          </span>
          <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>
            🚫 Avoid Athletic Wear
          </span>
        </div>
      )}
    </div>
  );
};
