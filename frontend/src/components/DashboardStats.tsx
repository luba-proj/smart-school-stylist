import React from 'react';
import type { FeedbackLog } from '../types';

interface DashboardStatsProps {
  feedbackLogs: FeedbackLog[];
  totalWardrobeCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  feedbackLogs,
  totalWardrobeCount
}) => {
  // Calculate stats
  const totalStyled = 24 + feedbackLogs.length; // baseline + current session
  
  // Counts
  const likes = 21 + feedbackLogs.filter(l => l.rating === 'like').length;
  const totalRatings = totalStyled;
  const approvalRate = Math.round((likes / totalRatings) * 100);

  // Sensory flags (dislikes + temp complaints)
  const sensoryAlerts = feedbackLogs.filter(l => l.rating !== 'like').length + 2;

  return (
    <div className="glass-card" id="dashboard-stats-card">
      <h3 style={{ fontFamily: 'var(--font-family-playful)', fontSize: '1.25rem' }}>
        📈 Parent Styling Analytics
      </h3>
      
      {/* 3 KPI Widgets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* KPI 1: Approval Rate */}
        <div 
          style={{ 
            background: 'var(--bg-page)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '1rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Outfit Approval
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {approvalRate}%
            </div>
          </div>
          <div style={{ width: '4rem', height: '4rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Circular Progress Mockup */}
            <svg width="60" height="60" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--emma-primary)"
                strokeWidth="3.5"
                strokeDasharray={`${approvalRate}, 100`}
              />
            </svg>
            <span style={{ position: 'absolute', fontSize: '0.85rem', fontWeight: 800 }}>👍</span>
          </div>
        </div>

        {/* KPI 2: Outfits Structured */}
        <div 
          style={{ 
            background: 'var(--bg-page)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '1rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Outfits Generated ({totalWardrobeCount} Items)
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {totalStyled}
            </div>
          </div>
          <div style={{ fontSize: '2rem', background: 'rgba(59, 130, 246, 0.1)', width: '3.25rem', height: '3.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            👕
          </div>
        </div>

        {/* KPI 3: Sensory Avoided Alerts */}
        <div 
          style={{ 
            background: 'var(--bg-page)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '1rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Sensory Interventions
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.15rem' }}>
              {sensoryAlerts}
            </div>
          </div>
          <div style={{ fontSize: '2rem', background: 'rgba(239, 68, 68, 0.1)', width: '3.25rem', height: '3.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            ⚠️
          </div>
        </div>

      </div>

      {/* Scrolling Feedback Feed */}
      <div 
        style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Activity Logs
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {feedbackLogs.map((log) => {
            const isLike = log.rating === 'like';
            const isDislike = log.rating === 'dislike';
            const isWarm = log.rating === 'too_warm';
            const isCold = log.rating === 'too_cold';
            
            return (
              <div
                key={log.id}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: isLike 
                    ? 'rgba(16, 185, 129, 0.08)' 
                    : isDislike
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${
                    isLike 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : isDislike
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)'
                  }`,
                  color: 'var(--text-primary)',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.15rem' }}>
                  <span>👤 {log.childId.toUpperCase()}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{log.timestamp}</span>
                </div>
                <div>
                  {isLike && `❤️ Approved recommendation: ${log.outfitSummary}`}
                  {isDislike && `👎 Rejected outfit: ${log.outfitSummary}`}
                  {isWarm && `🌡️ Flagged too warm: ${log.outfitSummary}`}
                  {isCold && `❄️ Flagged too chilly: ${log.outfitSummary}`}
                </div>
              </div>
            );
          })}

          {/* Baseline Static Logs */}
          <div style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.04)', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>👤 EMMA</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Yesterday</span>
            </div>
            <div>❤️ Approved recommendation: Violet Unicorn Tee & flowy skirt</div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.04)', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>👤 MIA</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>2 days ago</span>
            </div>
            <div>⚠️ Sensory Avoided: Stiff Denim Waistband Shorts (squeezing waistband)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
