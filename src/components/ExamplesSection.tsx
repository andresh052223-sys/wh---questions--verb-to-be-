import React, { useState } from 'react';
import {
  Volume2,
  ChevronDown,
  EyeOff,
  Eye,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { GENERAL_KNOWLEDGE_EXAMPLES } from '../data/learningData';
import { speakText, sound } from '../utils/audio';

interface ExamplesSectionProps {
  spanishHelp: boolean;
  revealedIds: string[];
  onRevealQuestion: (id: string) => void;
  onNextSection: () => void;
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({
  spanishHelp,
  revealedIds,
  onRevealQuestion,
  onNextSection,
}) => {
  // State for which cards are currently open
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string, questionText: string) => {
    sound.playClick();
    const isOpening = !openCards[id];
    setOpenCards(prev => ({
      ...prev,
      [id]: isOpening,
    }));

    if (isOpening) {
      onRevealQuestion(id);
      // Automatically pronounce when clicked open
      speakText(questionText);
    }
  };

  const handleHideAnswer = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sound.playClick();
    setOpenCards(prev => ({
      ...prev,
      [id]: false,
    }));
  };

  const showAllAnswers = () => {
    sound.playClick();
    const allOpen: Record<string, boolean> = {};
    GENERAL_KNOWLEDGE_EXAMPLES.forEach(ex => {
      allOpen[ex.id] = true;
      onRevealQuestion(ex.id);
    });
    setOpenCards(allOpen);
  };

  const hideAllAnswers = () => {
    sound.playClick();
    setOpenCards({});
  };

  const exploredCount = GENERAL_KNOWLEDGE_EXAMPLES.filter(ex => revealedIds.includes(ex.id)).length;

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            Section 2
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            2. Examples
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-1 font-medium">
            Click or tap each question card to discover the answer with the verb TO BE.
          </p>
          {spanishHelp && (
            <p className="text-amber-800 text-sm mt-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
              💡 Haz clic o toca cada tarjeta para descubrir la respuesta usando el verbo TO BE.
            </p>
          )}
        </div>

        {/* Global Controls & Counter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={showAllAnswers}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show All</span>
          </button>
          <button
            onClick={hideAllAnswers}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide All</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800">
            Explored: {exploredCount}/{GENERAL_KNOWLEDGE_EXAMPLES.length}
          </div>
        </div>
      </div>

      {/* Progress reminder banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-emerald-900">
            Notice how every question follows the formula: <span className="underline decoration-emerald-500 font-bold">WH-Word + TO BE + Subject</span>, and each answer uses <span className="font-bold">TO BE</span> to provide the information!
          </p>
        </div>
      </div>

      {/* Grid of Large Clickable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {GENERAL_KNOWLEDGE_EXAMPLES.map((item, index) => {
          const isOpen = !!openCards[item.id];
          const hasExplored = revealedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleCard(item.id, item.question)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCard(item.id, item.question);
                }
              }}
              className={`rounded-2xl border-2 transition-all p-5 sm:p-6 text-left cursor-pointer flex flex-col justify-between ${
                isOpen
                  ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Card Header: WH tag, Category, and Number */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-900 text-white">
                      {item.whWord}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasExplored && (
                      <span title="Explored">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Question Text (Large Typography) */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                    {item.question}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(item.question);
                    }}
                    type="button"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors shrink-0"
                    title="Pronounce question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {spanishHelp && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 italic font-medium">
                    {item.questionEs}
                  </p>
                )}
              </div>

              {/* Bottom State: Tap prompt or Revealed Answer */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {!isOpen ? (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>Tap to reveal answer</span>
                    <ChevronDown className="w-4 h-4 text-emerald-600 animate-bounce" />
                  </div>
                ) : (
                  <div className="space-y-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                          Answer:
                        </span>
                        <p className="text-base sm:text-lg font-bold text-slate-900">
                          {item.answer}
                        </p>
                        {spanishHelp && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            {item.answerEs}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(item.answer);
                        }}
                        type="button"
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors shrink-0"
                        title="Pronounce answer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Hide Answer Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={(e) => handleHideAnswer(e, item.id)}
                        type="button"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Answer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA to Activity 1 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl">
        <div>
          <p className="font-bold text-base sm:text-lg">Ready to practice forming questions?</p>
          <p className="text-xs sm:text-sm text-slate-400">Put scrambled words in order in Activity 1.</p>
        </div>
        <button
          onClick={onNextSection}
          type="button"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer text-base"
        >
          <span>Continue to 3. Activity 1</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
