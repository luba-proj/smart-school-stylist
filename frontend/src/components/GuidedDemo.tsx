import { useState, useEffect, useRef, useCallback } from 'react';
import type { Child } from '../types';

// ── Demo step definition ──
interface DemoStep {
  /** Unique step label */
  id: string;
  /** Short friendly caption shown in the controller */
  caption: string;
  /** Which child to select ('emma' | 'mia') */
  childId?: string;
  /** Weather key to set */
  weatherKey?: string;
  /** School key to set */
  schoolKey?: string;
  /** Tab to activate */
  tab?: 'recommendation' | 'wardrobe';
  /** Action to fire after state changes settle */
  action?: 'generate' | 'generateUpdated' | 'like' | 'too_cold';
  /** CSS IDs of UI sections to highlight */
  highlightIds: string[];
  /** Duration in ms for this step (before auto-advance) */
  durationMs: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'step1',
    caption: 'Emma starts with a warm regular school day.',
    childId: 'emma',
    weatherKey: 'sunny',
    schoolKey: 'regular',
    tab: 'recommendation',
    action: 'generate',
    highlightIds: ['child-selector-card', 'weather-card', 'school-context-card'],
    durationMs: 7000,
  },
  {
    id: 'step2',
    caption: 'Aura learns that Emma likes this style.',
    action: 'like',
    highlightIds: ['feedback-section-card'],
    durationMs: 5000,
  },
  {
    id: 'step3',
    caption: 'The Weather Agent detects that the outfit is no longer rain-ready.',
    weatherKey: 'rainy',
    highlightIds: ['weather-card', 'smart-alert-card'],
    durationMs: 6000,
  },
  {
    id: 'step4',
    caption: 'Aura updates the outfit with waterproof layers.',
    action: 'generateUpdated',
    highlightIds: ['outfit-recommendation-card'],
    durationMs: 8000,
  },
  {
    id: 'step5',
    caption: 'The School Context Agent detects PE requirements.',
    schoolKey: 'pe',
    highlightIds: ['school-context-card', 'smart-alert-card'],
    durationMs: 6000,
  },
  {
    id: 'step6',
    caption: 'Aura switches to athletic clothing and sneakers.',
    action: 'generateUpdated',
    highlightIds: ['outfit-recommendation-card'],
    durationMs: 8000,
  },
  {
    id: 'step7',
    caption: 'Mia gets a warm winter-ready outfit.',
    childId: 'mia',
    weatherKey: 'snowy',
    schoolKey: 'regular',
    action: 'generate',
    highlightIds: ['child-selector-card', 'outfit-recommendation-card'],
    durationMs: 8000,
  },
  {
    id: 'step8',
    caption: 'Feedback Memory helps Aura add warmer layers.',
    action: 'too_cold',
    highlightIds: ['feedback-section-card'],
    durationMs: 5000,
  },
  {
    id: 'step9',
    caption: "The Wardrobe Agent uses real clothing photos from the child's closet.",
    tab: 'wardrobe',
    highlightIds: ['wardrobe-gallery-card'],
    durationMs: 6000,
  },
  {
    id: 'step10',
    caption: 'Smart School Stylist combines agents, memory, rules, and feedback to reduce morning stress.',
    tab: 'recommendation',
    highlightIds: [],
    durationMs: 7000,
  },
];

// ── Props from App.tsx ──
interface GuidedDemoProps {
  /** List of mock children for lookup */
  children: Child[];
  /** Callbacks to mutate app state */
  setSelectedChild: (child: Child) => void;
  setWeatherKey: (key: string) => void;
  setSchoolKey: (key: string) => void;
  setActiveTab: (tab: 'recommendation' | 'wardrobe') => void;
  handleGenerateNewOutfit: () => void;
  handleGenerateUpdatedOutfit: () => void;
  handleFeedback: (rating: 'like' | 'dislike' | 'too_warm' | 'too_cold') => void;
  /** Communicate highlight IDs back to App */
  onHighlightChange: (ids: string[]) => void;
  /** Tell App whether demo is active */
  onDemoActiveChange: (active: boolean) => void;
}

export function GuidedDemo({
  children: mockChildren,
  setSelectedChild,
  setWeatherKey,
  setSchoolKey,
  setActiveTab,
  handleGenerateNewOutfit,
  handleGenerateUpdatedOutfit,
  handleFeedback,
  onHighlightChange,
  onDemoActiveChange,
}: GuidedDemoProps) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100 percent through current step

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionFiredRef = useRef(false);
  const stepStartTimeRef = useRef(0);
  const remainingTimeRef = useRef(0);

  const totalSteps = DEMO_STEPS.length;
  const currentStep = active ? DEMO_STEPS[stepIndex] : null;

  // ── Cleanup helper ──
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // ── Start the demo ──
  const startDemo = useCallback(() => {
    setActive(true);
    setPaused(false);
    setStepIndex(0);
    setProgress(0);
    actionFiredRef.current = false;
    onDemoActiveChange(true);
  }, [onDemoActiveChange]);

  // ── Stop the demo ──
  const stopDemo = useCallback(() => {
    clearTimers();
    setActive(false);
    setPaused(false);
    setStepIndex(0);
    setProgress(0);
    onHighlightChange([]);
    onDemoActiveChange(false);
  }, [clearTimers, onHighlightChange, onDemoActiveChange]);

  // ── Advance to next step ──
  const nextStep = useCallback(() => {
    clearTimers();
    actionFiredRef.current = false;
    if (stepIndex + 1 >= totalSteps) {
      // Demo complete
      stopDemo();
    } else {
      setStepIndex(prev => prev + 1);
      setProgress(0);
    }
  }, [clearTimers, stepIndex, totalSteps, stopDemo]);

  // ── Pause / Resume ──
  const togglePause = useCallback(() => {
    if (paused) {
      // Resume
      setPaused(false);
    } else {
      // Pause
      clearTimers();
      // Calculate remaining time
      const elapsed = Date.now() - stepStartTimeRef.current;
      const step = DEMO_STEPS[stepIndex];
      remainingTimeRef.current = Math.max(500, step.durationMs - elapsed);
      setPaused(true);
    }
  }, [paused, clearTimers, stepIndex]);

  // ── Execute a step: apply state mutations ──
  useEffect(() => {
    if (!active || !currentStep) return;

    // Apply state changes for this step
    if (currentStep.childId) {
      const child = mockChildren.find(c => c.id === currentStep.childId);
      if (child) setSelectedChild(child);
    }
    if (currentStep.weatherKey) setWeatherKey(currentStep.weatherKey);
    if (currentStep.schoolKey) setSchoolKey(currentStep.schoolKey);
    if (currentStep.tab) setActiveTab(currentStep.tab);

    // Set highlights
    onHighlightChange(currentStep.highlightIds);

    // Smoothly scroll the highlighted element into view
    if (currentStep.highlightIds && currentStep.highlightIds.length > 0) {
      setTimeout(() => {
        const firstId = currentStep.highlightIds[0];
        const element = document.getElementById(firstId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Fire action after a short settle delay
    actionFiredRef.current = false;
    const actionDelay = setTimeout(() => {
      if (!currentStep.action) {
        actionFiredRef.current = true;
        return;
      }
      switch (currentStep.action) {
        case 'generate':
          handleGenerateNewOutfit();
          break;
        case 'generateUpdated':
          handleGenerateUpdatedOutfit();
          break;
        case 'like':
          handleFeedback('like');
          break;
        case 'too_cold':
          handleFeedback('too_cold');
          break;
      }
      actionFiredRef.current = true;
    }, 600);

    return () => clearTimeout(actionDelay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  // ── Auto-advance timer & progress bar ──
  useEffect(() => {
    if (!active || paused || !currentStep) return;

    const duration = remainingTimeRef.current > 0 ? remainingTimeRef.current : currentStep.durationMs;
    remainingTimeRef.current = 0;
    stepStartTimeRef.current = Date.now();

    // Progress bar tick (update every 50ms)
    const startProgress = progress;
    const progressSpan = 100 - startProgress;
    const tickMs = 50;
    const totalTicks = duration / tickMs;
    let tick = 0;

    progressIntervalRef.current = setInterval(() => {
      tick++;
      const pct = startProgress + (progressSpan * tick) / totalTicks;
      setProgress(Math.min(100, pct));
    }, tickMs);

    // Auto-advance after duration
    timerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      nextStep();
    }, duration);

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, stepIndex]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // ── Expose startDemo for parent to call ──
  // We use a ref-forwarding pattern via a global callback
  useEffect(() => {
    (window as any).__startGuidedDemo = startDemo;
    return () => { delete (window as any).__startGuidedDemo; };
  }, [startDemo]);

  if (!active) return null;

  const overallProgress = ((stepIndex) / totalSteps) * 100 + (progress / totalSteps);

  return (
    <>
      {/* Scrim overlay (click-through except on controller) */}
      <div className="demo-scrim" />

      {/* Floating Demo Controller */}
      <div className="demo-controller">
        {/* Overall progress bar */}
        <div className="demo-progress-track">
          <div
            className="demo-progress-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="demo-controller-body">
          {/* Step indicator */}
          <div className="demo-step-badge">
            Step {stepIndex + 1} of {totalSteps}
          </div>

          {/* Caption */}
          <div className="demo-caption" key={currentStep?.id}>
            {currentStep?.caption}
          </div>

          {/* Controls */}
          <div className="demo-controls">
            <button
              className="demo-ctrl-btn"
              onClick={togglePause}
              title={paused ? 'Resume' : 'Pause'}
            >
              {paused ? '▶️' : '⏸️'}
            </button>
            <button
              className="demo-ctrl-btn demo-ctrl-stop"
              onClick={stopDemo}
              title="Stop Demo"
            >
              ⏹️
            </button>
            <button
              className="demo-ctrl-btn demo-ctrl-next"
              onClick={nextStep}
              title="Next Step"
            >
              ⏭️
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
