import React from 'react';
import {
  BookOpen,
  HelpCircle,
  Puzzle,
  GitCompare,
  FileText,
  User,
  Edit3,
} from 'lucide-react';
import { ApprenticeProgress, ApprenticeProfile } from '../types';

interface HeaderProps {
  currentSection: 'grammar' | 'examples' | 'activity1' | 'activity2' | 'results';
  onSelectSection: (section: 'grammar' | 'examples' | 'activity1' | 'activity2' | 'results') => void;
  progress: ApprenticeProgress;
  profile: ApprenticeProfile;
  onEditProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onSelectSection,
  progress,
  profile,
  onEditProfile,
}) => {
  // Calculate overall percentage
  const grammarScore = progress.grammarReviewed ? 20 : Math.min(20, progress.reviewedWhCount * 3.3);
  const examplesScore = Math.min(20, (progress.examplesRevealed.length / 8) * 20);
  const act1Score = progress.activity1Completed
    ? 30
    : progress.activity1Total > 0
    ? (progress.activity1Correct / progress.activity1Total) * 30
    : 0;
  const act2Score = progress.activity2Completed
    ? 30
    : (progress.activity2Correct / 10) * 30;
  const overallPercentage = Math.round(grammarScore + examplesScore + act1Score + act2Score);

  const navItems = [
    { id: 'grammar', label: '1. Grammar Review', icon: BookOpen, completed: progress.grammarReviewed },
    { id: 'examples', label: '2. Examples', icon: HelpCircle, completed: progress.examplesRevealed.length >= 6 },
    { id: 'activity1', label: '3. Activity 1: Order', icon: Puzzle, completed: progress.activity1Completed },
    { id: 'activity2', label: '4. Activity 2: Match', icon: GitCompare, completed: progress.activity2Completed },
    { id: 'results', label: 'Resultados y PDF', icon: FileText, completed: progress.activity1Completed && progress.activity2Completed },
  ] as const;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with SENA identification & Apprentice Name */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white tracking-wide uppercase">
            SENA
          </span>
          <span className="text-xs font-semibold text-slate-600">
            English Apprentices • Level A1–A2
          </span>
        </div>

        {/* Apprentice identity badge (clickable to edit) */}
        {profile.name ? (
          <button
            onClick={onEditProfile}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
            title="Haz clic para editar tu nombre o programa"
          >
            <User className="w-3.5 h-3.5 text-emerald-700" />
            <span className="truncate max-w-[200px] sm:max-w-xs">
              {profile.name} {profile.program ? `• ${profile.program}` : ''}
            </span>
            <Edit3 className="w-3 h-3 text-emerald-600 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={onEditProfile}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Registrar Aprendiz</span>
          </button>
        )}
      </div>

      {/* Main Title & Subtitle */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              WH-QUESTIONS WITH TO BE
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
              Learn, practice and master WH-questions with the verb TO BE.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>APPRENTICE PROGRESS</span>
              <span className="text-emerald-700 text-sm font-extrabold">{overallPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(5, overallPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                type="button"
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.completed && (
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
