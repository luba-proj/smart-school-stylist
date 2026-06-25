import React from 'react';
import type { WeatherCondition, WeatherType } from '../types';

interface WeatherCardProps {
  weather: WeatherCondition;
  currentScenario: string;
  onScenarioChange: (scenario: string) => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  currentScenario,
  onScenarioChange
}) => {
  // Render a beautiful, styled SVG representing the weather condition for a highly polished UI
  const renderWeatherSvg = (condition: WeatherType) => {
    switch (condition) {
      case 'sunny':
        return (
          <svg width="60" height="60" viewBox="0 0 100 100" style={{ animation: 'spin 12s linear infinite' }}>
            <circle cx="50" cy="50" r="24" fill="#fbbf24" filter="drop-shadow(0 0 6px #f59e0b)" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <line
                key={idx}
                x1="50" y1="12" x2="50" y2="24"
                stroke="#fbbf24" strokeWidth="6" strokeLinecap="round"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </svg>
        );
      case 'windy':
        return (
          <svg width="60" height="60" viewBox="0 0 100 100">
            <path
              d="M15 35 C 30 35, 40 30, 50 35 C 60 40, 70 45, 80 35 C 85 30, 80 20, 75 25 C 70 30, 75 35, 85 35"
              fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round"
              style={{ strokeDasharray: '200', strokeDashoffset: '0', animation: 'windFlow 3s linear infinite' }}
            />
            <path
              d="M10 55 C 25 55, 35 50, 45 55 C 55 60, 65 65, 75 55 C 80 50, 75 40, 70 45 C 65 50, 70 55, 80 55"
              fill="none" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round"
              style={{ strokeDasharray: '200', strokeDashoffset: '10', animation: 'windFlow 4s linear infinite' }}
            />
          </svg>
        );
      case 'rainy':
        return (
          <svg width="60" height="60" viewBox="0 0 100 100">
            {/* Cloud */}
            <path d="M25 60 A20 20 0 0 1 40 30 A25 25 0 0 1 80 40 A20 20 0 0 1 75 60 Z" fill="#94a3b8" />
            {/* Raindrops */}
            <line x1="35" y1="70" x2="30" y2="85" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" style={{ animation: 'rainFall 1.2s infinite linear' }} />
            <line x1="50" y1="72" x2="45" y2="87" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" style={{ animation: 'rainFall 1.2s infinite linear', animationDelay: '0.4s' }} />
            <line x1="65" y1="70" x2="60" y2="85" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" style={{ animation: 'rainFall 1.2s infinite linear', animationDelay: '0.8s' }} />
          </svg>
        );
      case 'snowy':
        return (
          <svg width="60" height="60" viewBox="0 0 100 100">
            {/* Cloud */}
            <path d="M25 60 A20 20 0 0 1 40 30 A25 25 0 0 1 80 40 A20 20 0 0 1 75 60 Z" fill="#cbd5e1" />
            {/* Snowflakes */}
            <circle cx="35" cy="75" r="3" fill="#e2e8f0" style={{ animation: 'snowFall 2s infinite linear' }} />
            <circle cx="52" cy="78" r="3.5" fill="#ffffff" style={{ animation: 'snowFall 2s infinite linear', animationDelay: '0.7s' }} />
            <circle cx="68" cy="75" r="2.5" fill="#e2e8f0" style={{ animation: 'snowFall 2s infinite linear', animationDelay: '1.4s' }} />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-card" id="weather-card">
      <div className="flex-between">
        <h3 style={{ fontFamily: 'var(--font-family-playful)', fontSize: '1.25rem' }}>
          ☀️ Weather Tracker
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
          <option value="sunny">☀️ Sunny & Warm</option>
          <option value="windy">💨 Chilly & Windy</option>
          <option value="rainy">🌧️ Rainy & Damp</option>
          <option value="snowy">❄️ Snowy & Freezing</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.5rem', borderRadius: '1rem' }}>
          {renderWeatherSvg(weather.condition)}
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline' }}>
            {weather.temp}°F
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 500 }}>
              H: {weather.high}° L: {weather.low}°
            </span>
          </div>
          <div style={{ textTransform: 'capitalize', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {weather.condition === 'sunny' && '☀️ Sunny Day'}
            {weather.condition === 'windy' && '💨 High Winds'}
            {weather.condition === 'rainy' && '🌧️ Rainfall'}
            {weather.condition === 'snowy' && '❄️ Snowfall Warning'}
          </div>
        </div>
      </div>

      <div 
        style={{ 
          background: 'rgba(59, 130, 246, 0.08)', 
          border: '1px solid rgba(59, 130, 246, 0.15)',
          padding: '1rem', 
          borderRadius: '0.75rem', 
          fontSize: '0.9rem', 
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}
      >
        <strong style={{ color: '#2563eb' }}>Styling Guide: </strong> 
        {weather.message}
      </div>

      {/* Embedded Animations injected locally */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes windFlow {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: -200; }
        }
        @keyframes rainFall {
          0% { transform: translateY(-5px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        @keyframes snowFall {
          0% { transform: translateY(-5px) translateX(0); opacity: 0; }
          50% { opacity: 1; transform: translateY(5px) translateX(3px); }
          100% { transform: translateY(15px) translateX(-3px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
