/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GrammarReview } from './components/GrammarReview';
import { ExamplesSection } from './components/ExamplesSection';
import { ActivityOneOrganize } from './components/ActivityOneOrganize';
import { ActivityTwoMatching } from './components/ActivityTwoMatching';
import { FinalResults } from './components/FinalResults';
import { ApprenticeModal } from './components/ApprenticeModal';
import { ApprenticeProgress, ApprenticeProfile } from './types';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  PROFILE: 'sena_wh_profile',
  PROGRESS: 'sena_wh_progress',
  SECTION: 'sena_wh_section',
  ACT1_STATE: 'sena_wh_act1_state',
};

const DEFAULT_PROGRESS: ApprenticeProgress = {
  grammarReviewed: false,
  reviewedWhCount: 0,
  examplesRevealed: [],
  activity1Completed: false,
  activity1Score: 0,
  activity1Total: 30,
  activity1Correct: 0,
  activity1Incorrect: 0,
  activity2Completed: false,
  activity2Score: 0,
  activity2Total: 10,
  activity2Correct: 0,
};

export default function App() {
  // Apprentice Profile state
  const [profile, setProfile] = useState<ApprenticeProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { name: '', program: '' };
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.trim()) return false;
      }
    } catch {
      // ignore
    }
    return true; // Open on first visit to register
  });

  // Active section state
  const [currentSection, setCurrentSection] = useState<'grammar' | 'examples' | 'activity1' | 'activity2' | 'results'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECTION);
      if (saved && ['grammar', 'examples', 'activity1', 'activity2', 'results'].includes(saved)) {
        return saved as 'grammar' | 'examples' | 'activity1' | 'activity2' | 'results';
      }
    } catch {
      // ignore
    }
    return 'grammar';
  });

  // Overall apprentice progress state
  const [progress, setProgress] = useState<ApprenticeProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (saved) return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_PROGRESS;
  });

  // Activity 1 persistent sub-state (question index, correct, incorrect)
  const [act1State, setAct1State] = useState<{ correct: number; incorrect: number; index: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACT1_STATE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { correct: 0, incorrect: 0, index: 0 };
  });

  // Save profile to localStorage
  const handleSaveProfile = (newProfile: ApprenticeProfile) => {
    setProfile(newProfile);
    setIsProfileModalOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } catch {
      // ignore
    }
  };

  // Sync section to localStorage
  const handleSelectSection = (sec: 'grammar' | 'examples' | 'activity1' | 'activity2' | 'results') => {
    sound.playClick();
    setCurrentSection(sec);
    try {
      localStorage.setItem(STORAGE_KEYS.SECTION, sec);
    } catch {
      // ignore
    }
  };

  // Sync progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const handleGrammarComplete = () => {
    setProgress((prev) => ({
      ...prev,
      grammarReviewed: true,
      reviewedWhCount: 6,
    }));
  };

  const handleRevealExample = (id: string) => {
    setProgress((prev) => {
      if (prev.examplesRevealed.includes(id)) return prev;
      return {
        ...prev,
        examplesRevealed: [...prev.examplesRevealed, id],
      };
    });
  };

  const handleActivity1Update = (correct: number, incorrect: number, total: number, scorePercent: number) => {
    setProgress((prev) => ({
      ...prev,
      activity1Completed: true,
      activity1Correct: correct,
      activity1Incorrect: incorrect,
      activity1Total: total,
      activity1Score: scorePercent,
    }));
  };

  const handleSaveAct1Progress = (correct: number, incorrect: number, index: number) => {
    const newState = { correct, incorrect, index };
    setAct1State(newState);
    try {
      localStorage.setItem(STORAGE_KEYS.ACT1_STATE, JSON.stringify(newState));
    } catch {
      // ignore
    }
  };

  const handleActivity2Update = (correct: number, total: number, scorePercent: number) => {
    setProgress((prev) => ({
      ...prev,
      activity2Completed: true,
      activity2Correct: correct,
      activity2Total: total,
      activity2Score: scorePercent,
    }));
  };

  const handleTryAgainFromResults = () => {
    setProgress((prev) => ({
      ...prev,
      activity1Completed: false,
      activity1Correct: 0,
      activity1Incorrect: 0,
      activity1Score: 0,
      activity2Completed: false,
      activity2Correct: 0,
      activity2Score: 0,
    }));
    setAct1State({ correct: 0, incorrect: 0, index: 0 });
    try {
      localStorage.removeItem(STORAGE_KEYS.ACT1_STATE);
    } catch {
      // ignore
    }
    handleSelectSection('activity1');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Onboarding / Profile Registration Modal */}
      <ApprenticeModal
        isOpen={isProfileModalOpen}
        currentProfile={profile}
        onSave={handleSaveProfile}
        onClose={() => setIsProfileModalOpen(false)}
        isInitialSetup={!profile.name}
      />

      {/* Persistent Header */}
      <Header
        currentSection={currentSection}
        onSelectSection={handleSelectSection}
        progress={progress}
        profile={profile}
        onEditProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Dynamic Workspace */}
      <main className="flex-1 pb-16">
        {currentSection === 'grammar' && (
          <GrammarReview
            spanishHelp={true}
            onComplete={handleGrammarComplete}
            onNextSection={() => {
              handleGrammarComplete();
              handleSelectSection('examples');
            }}
          />
        )}

        {currentSection === 'examples' && (
          <ExamplesSection
            spanishHelp={true}
            revealedIds={progress.examplesRevealed}
            onRevealQuestion={handleRevealExample}
            onNextSection={() => handleSelectSection('activity1')}
          />
        )}

        {currentSection === 'activity1' && (
          <ActivityOneOrganize
            onUpdateResults={handleActivity1Update}
            onNextSection={() => handleSelectSection('activity2')}
            savedCorrect={act1State.correct}
            savedIncorrect={act1State.incorrect}
            savedIndex={act1State.index}
            onSaveProgress={handleSaveAct1Progress}
          />
        )}

        {currentSection === 'activity2' && (
          <ActivityTwoMatching
            onUpdateResults={handleActivity2Update}
            onGoToResults={() => handleSelectSection('results')}
            savedCompletedSets={progress.activity2Correct}
          />
        )}

        {currentSection === 'results' && (
          <FinalResults
            progress={progress}
            profile={profile}
            onEditProfile={() => setIsProfileModalOpen(true)}
            onTryAgain={handleTryAgainFromResults}
            onReviewGrammar={() => handleSelectSection('grammar')}
            onGoToMatching={() => handleSelectSection('activity2')}
          />
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-semibold">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Servicio Nacional de Aprendizaje – SENA Bilingualism Program</span>
          <span>WH-Questions with TO BE • Level A1–A2 English Training</span>
        </div>
      </footer>
    </div>
  );
}
