import { useState, useEffect } from 'react';
import { mockChildren } from './mock/children';
import { mockWeatherScenarios } from './mock/weather';
import { mockSchoolScenarios } from './mock/school';
import { generateOutfitRecommendation, generatePreCuratedOutfit } from './mock/outfits';
import { mockWardrobes } from './mock/wardrobe';
import type { Child, WeatherCondition, SchoolContext, Outfit } from './types';
import { validateOutfit } from './mock/rules';

// Component imports
import { ChildSelector } from './components/ChildSelector';
import { WeatherCard } from './components/WeatherCard';
import { SchoolContextCard } from './components/SchoolContextCard';
import { OutfitRecommendation, WhyThisOutfitCard, AgentWorkflowCard } from './components/OutfitRecommendation';
import { FeedbackSection } from './components/FeedbackSection';
import { WardrobeGallery } from './components/WardrobeGallery';
import { GuidedDemo } from './components/GuidedDemo';

export default function App() {
  // 1. Dashboard State
  const [selectedChild, setSelectedChild] = useState<Child>(mockChildren[0]);
  const [weatherKey, setWeatherKey] = useState<string>('sunny');
  const [schoolKey, setSchoolKey] = useState<string>('regular');
  const [activeTab, setActiveTab] = useState<'recommendation' | 'wardrobe'>('recommendation');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [aboutModalTab, setAboutModalTab] = useState<'about' | 'tech'>('about');
  
  // Simulated Multi-Agent workflow states
  const [outfitIteration, setOutfitIteration] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeAgentStep, setActiveAgentStep] = useState<number>(-1);
  const [recommendationType, setRecommendationType] = useState<'dynamic' | 'comfort' | 'weather' | 'activity' | 'style'>('dynamic');
  const [highlightedAgents, setHighlightedAgents] = useState<string[]>([]);
  
  // Track feedback specifically for the current combination to show active states
  const [currentFeedback, setCurrentFeedback] = useState<'like' | 'dislike' | 'too_warm' | 'too_cold' | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  
  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Feedback Memory state per child (persisted via localStorage)
  const [feedbackMemory, setFeedbackMemory] = useState<Record<string, {
    likedColors: string[];
    likedTags: string[];
    dislikedOutfits: string[];
    warmthOffset: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('smart_stylist_feedback_memory');
      return saved ? JSON.parse(saved) : {
        emma: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 },
        mia: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 }
      };
    } catch {
      return {
        emma: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 },
        mia: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 }
      };
    }
  });

  // Applied feedback memory is what the styling engine actually uses during the current render.
  const [appliedFeedbackMemory, setAppliedFeedbackMemory] = useState<Record<string, {
    likedColors: string[];
    likedTags: string[];
    dislikedOutfits: string[];
    warmthOffset: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('smart_stylist_feedback_memory');
      return saved ? JSON.parse(saved) : {
        emma: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 },
        mia: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 }
      };
    } catch {
      return {
        emma: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 },
        mia: { likedColors: [], likedTags: [], dislikedOutfits: [], warmthOffset: 0 }
      };
    }
  });

  // Check if current child has any active feedback memory
  const currentMemory = feedbackMemory[selectedChild.id];
  const hasMemory = !!(currentMemory && (
    currentMemory.likedColors.length > 0 ||
    currentMemory.likedTags.length > 0 ||
    currentMemory.dislikedOutfits.length > 0 ||
    currentMemory.warmthOffset !== 0
  ));

  // 2. Guided Demo Mode State
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [demoHighlightIds, setDemoHighlightIds] = useState<string[]>([]);

  const currentWeather: WeatherCondition = mockWeatherScenarios[weatherKey];
  const currentSchool: SchoolContext = mockSchoolScenarios[schoolKey];
  
  // Generate outfit recommendation dynamically or load pre-curated collections
  const currentOutfit: Outfit = recommendationType === 'dynamic'
    ? generateOutfitRecommendation(selectedChild, currentWeather, currentSchool, outfitIteration, appliedFeedbackMemory[selectedChild.id])
    : generatePreCuratedOutfit(selectedChild, currentWeather, currentSchool, recommendationType);
  const currentWardrobe = mockWardrobes[selectedChild.id];

  // Run the Outfit Rule Validation
  const validationResult = validateOutfit(
    currentOutfit,
    selectedChild,
    currentWeather,
    currentSchool,
    feedbackMemory[selectedChild.id]
  );

  // Dynamically adjust Match Score based on rule engine validation
  let adjustedScore = currentOutfit.suitabilityScore;
  if (!validationResult.isValid || validationResult.severity === 'critical') {
    adjustedScore = Math.min(55, adjustedScore - 30);
  } else if (validationResult.severity === 'warning') {
    adjustedScore = Math.min(80, adjustedScore - 15);
  }
  adjustedScore = Math.max(10, adjustedScore);

  const validatedOutfit = {
    ...currentOutfit,
    suitabilityScore: adjustedScore
  };

  // Reset current feedback button highlight and outfit iteration when child, weather, or school changes
  useEffect(() => {
    setCurrentFeedback(null);
    setOutfitIteration(0);
    setRecommendationType('dynamic');
    setHighlightedAgents([]);
    // Synchronize applied memory when child or weather context changes
    setAppliedFeedbackMemory(feedbackMemory);
  }, [selectedChild.id, weatherKey, schoolKey]);

  // Simulated timed multi-agent workflow progression for generating an alternative
  const handleGenerateNewOutfit = () => {
    if (isGenerating) return;
    
    setHighlightedAgents([]);
    setIsGenerating(true);
    setActiveAgentStep(0);
    
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= 5) {
        setActiveAgentStep(step);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setActiveAgentStep(-1);
        setRecommendationType('dynamic');
        
        // Sync the applied memory so the next generated outfit respects latest feedback!
        setAppliedFeedbackMemory(feedbackMemory);
        setOutfitIteration(prev => prev + 1);
        
        // Show success toast
        setToastMessage("✨ Aura's agents consolidated recommendations and generated an alternative outfit!");
        setTimeout(() => setToastMessage(null), 4000);
      }
    }, 450); // Snappy but satisfying multi-agent visualization
  };

  const handleGenerateUpdatedOutfit = () => {
    if (isGenerating) return;

    // Identify failed agents to highlight during and after generation
    const failedAgents = validationResult.failedAgents;
    const agentsToHighlight = [...failedAgents];
    if (!agentsToHighlight.includes('stylist')) {
      agentsToHighlight.push('stylist');
    }

    setHighlightedAgents(agentsToHighlight);
    setIsGenerating(true);
    setActiveAgentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= 5) {
        setActiveAgentStep(step);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setActiveAgentStep(-1);
        setRecommendationType('dynamic');

        // Sync the applied memory so the next generated outfit respects latest feedback!
        setAppliedFeedbackMemory(feedbackMemory);
        setOutfitIteration(prev => prev + 1);

        // Show success toast
        const agentNames = failedAgents.length > 0
          ? failedAgents.map(a => a.charAt(0).toUpperCase() + a.slice(1) + ' Agent').join(' & ')
          : 'Stylist Agent';
        setToastMessage(`✨ ${agentNames} successfully resolved the conflict and updated the outfit!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }, 450);
  };

  // Snappy multi-agent visualization when picking pre-curated collections
  const handleRecommendationTypeChange = (type: 'dynamic' | 'comfort' | 'weather' | 'activity' | 'style') => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setActiveAgentStep(0);
    
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= 5) {
        setActiveAgentStep(step);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setActiveAgentStep(-1);
        setRecommendationType(type);
        
        const labels = {
          dynamic: "Dynamic AI Recommendation loaded!",
          comfort: "Sensory Comfort First collection loaded!",
          weather: "Weather Protection Shield collection loaded!",
          activity: "School Event Approved collection loaded!",
          style: "Signature Style & Color collection loaded!"
        };
        setToastMessage(`✨ ${labels[type]}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }, 200); // Super snappy (200ms per step) for instant selector satisfaction
  };

  // Handle theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle feedback button clicks
  const handleFeedback = (rating: 'like' | 'dislike' | 'too_warm' | 'too_cold') => {
    setIsRefining(true);
    setCurrentFeedback(rating);

    // Update the feedback memory state
    const childId = selectedChild.id;
    const childMem = { ...feedbackMemory[childId] };

    if (rating === 'like') {
      const colors = [
        currentOutfit.top?.color,
        currentOutfit.bottom.color,
        currentOutfit.shoes.color,
        currentOutfit.outerwear?.color,
        currentOutfit.accessory?.color
      ].filter(Boolean) as string[];

      const tags = [
        ...(currentOutfit.top?.tags || []),
        ...currentOutfit.bottom.tags,
        ...currentOutfit.shoes.tags,
        ...(currentOutfit.outerwear?.tags || []),
        ...(currentOutfit.accessory?.tags || [])
      ];

      childMem.likedColors = Array.from(new Set([...childMem.likedColors, ...colors]));
      childMem.likedTags = Array.from(new Set([...childMem.likedTags, ...tags]));
    } else if (rating === 'dislike') {
      const comboKey = `${currentOutfit.top ? currentOutfit.top.id : 'none'}-${currentOutfit.bottom.id}-${currentOutfit.shoes.id}`;
      childMem.dislikedOutfits = Array.from(new Set([...childMem.dislikedOutfits, comboKey]));
    } else if (rating === 'too_warm') {
      childMem.warmthOffset -= 1;
    } else if (rating === 'too_cold') {
      childMem.warmthOffset += 1;
    }

    const updatedMemory = {
      ...feedbackMemory,
      [childId]: childMem
    };

    setFeedbackMemory(updatedMemory);

    try {
      localStorage.setItem('smart_stylist_feedback_memory', JSON.stringify(updatedMemory));
    } catch (e) {
      console.error('Failed to save feedback memory to localStorage', e);
    }

    // Show temporary toast with child-specific confirmation message
    const ratingLabels = {
      like: "Great! Aura will remember this style.",
      dislike: `Aura found a different outfit for ${selectedChild.name}.`,
      too_warm: "Aura updated the outfit with lighter clothing.",
      too_cold: "Aura updated the outfit with warmer layers."
    };
    setToastMessage(ratingLabels[rating]);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    // Apply the memory and complete the refining transition after a short delay (300ms)
    setTimeout(() => {
      setAppliedFeedbackMemory(updatedMemory);
      setIsRefining(false);
    }, 300);
  };

  // Demo mode helper: check if a given element ID should be highlighted
  const isDemoHighlighted = (id: string) => demoActive && demoHighlightIds.includes(id);

  // Start demo via the GuidedDemo component's exposed callback
  const startDemo = () => {
    if ((window as any).__startGuidedDemo) {
      (window as any).__startGuidedDemo();
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="brand-title" style={{ margin: 0 }}>
              🎒 Smart School Stylist
            </h1>
            <button 
              className="about-project-btn" 
              onClick={() => {
                setAboutModalTab('about');
                setShowAboutModal(true);
              }}
            >
              ⓘ About Project
            </button>
          </div>
          <div className="brand-subtitle">AI-Agentic Wardrobe Planner & Sensory Companion</div>
        </div>

        <div className="header-actions">
          {/* Demo Button */}
          <button 
            className="btn btn-secondary" 
            onClick={startDemo}
            disabled={demoActive}
            style={{ 
              background: demoActive
                ? 'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)'
                : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', 
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              opacity: demoActive ? 0.6 : 1,
              cursor: demoActive ? 'not-allowed' : 'pointer'
            }}
          >
            {demoActive ? '🎬 Demo Running...' : '✨ Start Guided Demo'}
          </button>

          {/* Theme Toggle */}
          <button 
            className="btn btn-icon" 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{ fontSize: '1.2rem' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* 2. Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="tabs-container" style={{ width: '100%', maxWidth: '500px' }}>
          <button 
            className={`tab-btn ${activeTab === 'recommendation' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendation')}
          >
            👚 Today's Outfit
          </button>
          <button 
            className={`tab-btn ${activeTab === 'wardrobe' ? 'active' : ''}`}
            onClick={() => setActiveTab('wardrobe')}
          >
            🚪 Wardrobe Closet
          </button>
        </div>
      </div>

      {/* 3. Dashboard Core Layout */}
      {/* 3. Dashboard Core Layout */}
      <div className="dashboard-layout">
        
        {/* Left Sidebar Column */}
        <div className="sidebar-column">
          {/* Children Profiles */}
          <div className={`sidebar-item ${isDemoHighlighted('child-selector-card') ? 'demo-highlight' : ''}`} id="child-selector-card">
            <ChildSelector 
              children={mockChildren}
              selectedChild={selectedChild}
              onSelect={setSelectedChild}
            />
          </div>

          {/* Weather Widget */}
          <div className={`sidebar-item ${isDemoHighlighted('weather-card') ? 'demo-highlight' : ''}`} id="weather-card">
            <WeatherCard 
              weather={currentWeather}
              currentScenario={weatherKey}
              onScenarioChange={setWeatherKey}
            />
          </div>

          {/* School Context Widget */}
          <div className={`sidebar-item ${isDemoHighlighted('school-context-card') ? 'demo-highlight' : ''}`} id="school-context-card">
            <SchoolContextCard 
              school={currentSchool}
              currentScenario={schoolKey}
              onScenarioChange={setSchoolKey}
            />
          </div>
        </div>

        {/* Right Main Content Column */}
        <div className="main-content-column">
          {activeTab === 'recommendation' ? (
            <>
              {/* Today's Recommendation (Clothing Grid Card) */}
              <div className={`main-item ${isDemoHighlighted('outfit-recommendation-card') ? 'demo-highlight' : ''}`} id="outfit-recommendation-card">
                <OutfitRecommendation 
                  outfit={validatedOutfit}
                  child={selectedChild}
                  isGenerating={isGenerating}
                  activeAgentStep={activeAgentStep}
                  onGenerateNewOutfit={handleGenerateNewOutfit}
                  recommendationType={recommendationType}
                  onRecommendationTypeChange={handleRecommendationTypeChange}
                  weather={currentWeather}
                  school={currentSchool}
                  currentFeedback={currentFeedback}
                  isRefining={isRefining}
                />
              </div>

              {/* Explanation Area: Why/Aura (left half) & Agent Workflow (right half) */}
              <div className="explanation-grid">
                <div className="explanation-left-col">
                  <WhyThisOutfitCard 
                    outfit={validatedOutfit}
                    child={selectedChild}
                    weather={currentWeather}
                    school={currentSchool}
                    currentFeedback={currentFeedback}
                    isRefining={isRefining}
                    validationResult={validationResult}
                  />
                </div>
                <div className="explanation-right-col">
                  <AgentWorkflowCard 
                    child={selectedChild}
                    isGenerating={isGenerating}
                    activeAgentStep={activeAgentStep}
                    currentFeedback={currentFeedback}
                    isRefining={isRefining}
                    highlightedAgents={highlightedAgents}
                  />
                </div>
              </div>

              {/* Smart Outfit Validation Alert */}
              {(!validationResult.isValid || validationResult.severity !== 'info') && (
                <div className="main-item" style={{ marginBottom: '1rem' }}>
                  <div 
                    style={{
                      background: validationResult.severity === 'critical' 
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)' 
                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
                      border: validationResult.severity === 'critical' 
                        ? '1px solid rgba(239, 68, 68, 0.25)' 
                        : '1px solid rgba(245, 158, 11, 0.25)',
                      borderLeft: validationResult.severity === 'critical' 
                        ? '6px solid #ef4444' 
                        : '6px solid #f59e0b',
                      borderRadius: '1rem',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>
                        {validationResult.severity === 'critical' ? '🚨' : '⚠️'}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-family-playful)' }}>
                        This outfit may no longer be the best match.
                      </h4>
                      <span 
                        className="badge" 
                        style={{ 
                          background: validationResult.severity === 'critical' ? '#fee2e2' : '#fef3c7', 
                          color: validationResult.severity === 'critical' ? '#991b1b' : '#92400e',
                          marginLeft: 'auto',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.5rem'
                        }}
                      >
                        {validationResult.severity}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '2rem' }}>
                      {validationResult.reasons.map((reason, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <span style={{ color: validationResult.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {validationResult.recommendedAction}
                      </span>
                      <button
                        onClick={handleGenerateUpdatedOutfit}
                        disabled={isGenerating}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.45rem 1.25rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                        }}
                      >
                        <span>✨ Generate Updated Outfit</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              <div className={`main-item ${isDemoHighlighted('feedback-section-card') ? 'demo-highlight' : ''}`} id="feedback-section-card">
                <FeedbackSection 
                  onFeedback={handleFeedback}
                  lastFeedback={currentFeedback}
                  childName={selectedChild.name}
                  hasMemory={hasMemory}
                />
              </div>
            </>
          ) : (
            /* Wardrobe Gallery Tab */
            <div className={`main-item ${isDemoHighlighted('wardrobe-gallery-card') ? 'demo-highlight' : ''}`} id="wardrobe-gallery-card">
              <WardrobeGallery 
                items={currentWardrobe}
                child={selectedChild}
              />
            </div>
          )}
        </div>

      </div>

      {/* 4. Toast Notifications */}
      {toastMessage && (
        <div className="toast-alert">
          <span style={{ fontSize: '1.25rem' }}>✅</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{toastMessage}</span>
        </div>
      )}

      {/* 5. Guided Demo Mode */}
      <GuidedDemo
        children={mockChildren}
        setSelectedChild={setSelectedChild}
        setWeatherKey={setWeatherKey}
        setSchoolKey={setSchoolKey}
        setActiveTab={setActiveTab}
        handleGenerateNewOutfit={handleGenerateNewOutfit}
        handleGenerateUpdatedOutfit={handleGenerateUpdatedOutfit}
        handleFeedback={handleFeedback}
        onHighlightChange={setDemoHighlightIds}
        onDemoActiveChange={setDemoActive}
      />

      {/* 6. About Project Premium Modal */}
      {showAboutModal && (
        <div className="about-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="about-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="about-modal-header">
              <h3>Smart School Stylist</h3>
              <button className="about-modal-close" onClick={() => setShowAboutModal(false)}>✕</button>
            </div>
            
            <div className="about-modal-tabs">
              <button 
                className={`about-modal-tab-btn ${aboutModalTab === 'about' ? 'active' : ''}`}
                onClick={() => setAboutModalTab('about')}
              >
                📖 About
              </button>
              <button 
                className={`about-modal-tab-btn ${aboutModalTab === 'tech' ? 'active' : ''}`}
                onClick={() => setAboutModalTab('tech')}
              >
                ⚡ Technology
              </button>
            </div>

            <div className="about-modal-body">
              {aboutModalTab === 'about' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="about-hero-card">
                    <h4>Smart School Stylist</h4>
                    <p>An AI-powered wardrobe assistant that helps parents choose the best school outfit for their child.</p>
                  </div>

                  <div>
                    <div className="about-features-title">Aura recommends outfits based on:</div>
                    <div className="about-features-list">
                      <div className="about-feature-item">
                        <span className="about-feature-icon">🌦️</span>
                        <div className="about-feature-text">
                          <strong>Weather</strong>
                          <p>Adapts to temperature, wind, and rain to keep your child comfortable throughout the day.</p>
                        </div>
                      </div>
                      <div className="about-feature-item">
                        <span className="about-feature-icon">🏃</span>
                        <div className="about-feature-text">
                          <strong>School activities</strong>
                          <p>Ensures dress code compliance and functionality (e.g. mandatory sneakers on PE/gym days).</p>
                        </div>
                      </div>
                      <div className="about-feature-item">
                        <span className="about-feature-icon">🚪</span>
                        <div className="about-feature-text">
                          <strong>Clothes available in the wardrobe</strong>
                          <p>Selects only from currently clean and available clothes in the digital closet.</p>
                        </div>
                      </div>
                      <div className="about-feature-item">
                        <span className="about-feature-icon">🧠</span>
                        <div className="about-feature-text">
                          <strong>Sensory preferences</strong>
                          <p>Actively avoids textures or fits your child dislikes (e.g. scratchy tags, tight waistbands).</p>
                        </div>
                      </div>
                      <div className="about-feature-item">
                        <span className="about-feature-icon">💬</span>
                        <div className="about-feature-text">
                          <strong>Parent feedback</strong>
                          <p>Continuously refines styling rules and preferences based on your thumbs up or flag ratings.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="about-goal-banner">
                    <span>🎯</span>
                    <div>The goal is to help children feel comfortable, confident, and appropriately dressed every school day.</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="tech-course-banner">
                    <h4>Built for</h4>
                    <p>Google 5-Day AI Agents: Intensive Vibe Coding Course</p>
                  </div>

                  <div className="tech-grid">
                    <div className="tech-subcard">
                      <h4>
                        <span>✓</span> Multi-Agent Architecture
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        Orchestrates specialized, cooperative nodes:
                      </p>
                      <ul className="tech-list">
                        <li>
                          <span className="bullet">•</span>
                          <span><strong>Profile Agent:</strong> Manages sensory dislikes & sizes</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span><strong>Wardrobe Agent:</strong> Inventories and queries available clothing</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span><strong>Weather Agent:</strong> Analyzes local forecasts for appropriate layers</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span><strong>School Context Agent:</strong> Restricts outfits by activity rules</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span><strong>Stylist Agent:</strong> Synthesizes constraints into final outfits</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span><strong>Feedback Memory Agent:</strong> Learns rules from parent responses</span>
                        </li>
                      </ul>
                    </div>

                    <div className="tech-subcard">
                      <h4>
                        <span>🤝</span> AI Concepts Demonstrated
                      </h4>
                      <ul className="tech-list" style={{ marginTop: '0.25rem' }}>
                        <li>
                          <span className="check">✓</span>
                          <span><strong>Agent Collaboration:</strong> Nodes resolving a multi-constraint styling task</span>
                        </li>
                        <li>
                          <span className="check">✓</span>
                          <span><strong>Memory Through Feedback:</strong> Dynamic reinforcement learning loop</span>
                        </li>
                        <li>
                          <span className="check">✓</span>
                          <span><strong>Human-in-the-Loop:</strong> Putting parents in control with direct reviews</span>
                        </li>
                        <li>
                          <span className="check">✓</span>
                          <span><strong>Tool-like Mock Data Access:</strong> Querying simulated relational databases</span>
                        </li>
                        <li>
                          <span className="check">✓</span>
                          <span><strong>React + TypeScript Frontend:</strong> Beautiful, responsive consumer layer</span>
                        </li>
                      </ul>
                    </div>

                    <div className="tech-subcard">
                      <h4>
                        <span>🛡️</span> Current Demo
                      </h4>
                      <ul className="tech-list">
                        <li>
                          <span className="bullet">•</span>
                          <span>Fully local mock data</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>No external APIs</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>No Gemini tokens required</span>
                        </li>
                      </ul>
                    </div>

                    <div className="tech-subcard">
                      <h4>
                        <span>🚀</span> Future Enhancements
                      </h4>
                      <ul className="tech-list">
                        <li>
                          <span className="bullet">•</span>
                          <span>Real wardrobe photos</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>Gemini integration</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>Google ADK backend</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>Weather API</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>Google Calendar integration</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>Persistent user profiles</span>
                        </li>
                        <li>
                          <span className="bullet">•</span>
                          <span>Learning from long-term feedback</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
