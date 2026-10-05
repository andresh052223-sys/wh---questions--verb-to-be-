import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { WH_WORDS_INFO, PRONOUN_CONJUGATIONS } from '../data/learningData';
import { speakText, sound } from '../utils/audio';

interface GrammarReviewProps {
  spanishHelp: boolean;
  onComplete: () => void;
  onNextSection: () => void;
}

export const GrammarReview: React.FC<GrammarReviewProps> = ({
  spanishHelp,
  onComplete,
  onNextSection,
}) => {
  const [expandedPronouns, setExpandedPronouns] = useState<Record<string, boolean>>({});
  const [activeWhTab, setActiveWhTab] = useState<string>('WHAT');
  const [hasMarkedCompleted, setHasMarkedCompleted] = useState<boolean>(false);

  const togglePronoun = (pronoun: string) => {
    sound.playClick();
    setExpandedPronouns(prev => ({
      ...prev,
      [pronoun]: !prev[pronoun],
    }));
  };

  const handleWhClick = (word: string) => {
    sound.playClick();
    setActiveWhTab(word);
    speakText(word);
  };

  const handleMarkComplete = () => {
    sound.playSuccess();
    setHasMarkedCompleted(true);
    onComplete();
  };

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            Section 1
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            1. Grammar Review
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-1 font-medium">
            Learn how to formulate information questions using WH-words and the verb TO BE.
          </p>
          {spanishHelp && (
            <p className="text-amber-800 text-sm mt-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
              💡 Aprende a formular preguntas de información usando las palabras WH y el verbo TO BE.
            </p>
          )}
        </div>

        <button
          onClick={handleMarkComplete}
          type="button"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border shadow-xs cursor-pointer ${
            hasMarkedCompleted
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500 hover:text-emerald-700'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{hasMarkedCompleted ? 'Grammar Reviewed ✓' : 'Mark as Reviewed'}</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. THE 6 MAIN WH-WORDS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              The Main WH-Words (Question Words)
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-0.5">
              Click any word to hear its pronunciation and view its meaning and usage.
            </p>
          </div>
          <span className="hidden sm:inline-flex text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            6 Core Words
          </span>
        </div>

        {/* Big Interactive Grid of 6 WH Words */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 my-6">
          {WH_WORDS_INFO.map((item) => {
            const isSelected = activeWhTab === item.word;
            return (
              <button
                key={item.word}
                onClick={() => handleWhClick(item.word)}
                type="button"
                className={`p-4 rounded-xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900">
                    {item.word}
                  </span>
                  <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <span className="text-sm sm:text-base font-bold text-emerald-700">
                  {item.translation}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {item.pronunciation}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected WH Word Detail Card */}
        {(() => {
          const selected = WH_WORDS_INFO.find((w) => w.word === activeWhTab) || WH_WORDS_INFO[0];
          return (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900">{selected.word}</span>
                  <span className="text-lg font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                    {selected.translation}
                  </span>
                  <button
                    onClick={() => speakText(selected.word)}
                    type="button"
                    className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    title="Listen pronunciation"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-base text-slate-800 font-medium">
                  {selected.usage}
                </p>
                {spanishHelp && (
                  <p className="text-sm text-slate-600 italic">
                    💡 {selected.usageEs}
                  </p>
                )}
              </div>

              {/* Sample question and answer box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 min-w-[280px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Example Question
                  </span>
                  <button
                    onClick={() => speakText(selected.exampleQuestion)}
                    className="text-slate-500 hover:text-emerald-700 transition-colors p-1"
                    title="Listen question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {selected.exampleQuestion}
                </p>
                <div className="pt-1 border-t border-slate-100 text-sm font-semibold text-emerald-800">
                  Answer: <span className="text-slate-700 font-normal">{selected.exampleAnswer}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. THE BASIC QUESTION STRUCTURE (LARGE TYPOGRAPHY) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          Basic Question Structure
        </h3>
        <p className="text-sm sm:text-base text-slate-600 font-medium mb-6">
          Follow this exact formula to build every WH-question with TO BE:
        </p>

        {/* Large Typography Formula Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 text-center projector-contrast mb-8">
          <div className="text-xs sm:text-sm uppercase tracking-widest text-emerald-400 font-bold mb-3">
            THE UNIVERSAL FORMULA
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-lg sm:text-2xl md:text-3xl font-extrabold">
            <span className="bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xs">
              WH-WORD
            </span>
            <span className="text-slate-400">+</span>
            <span className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xs">
              TO BE
            </span>
            <span className="text-slate-400">+</span>
            <span className="bg-amber-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xs">
              SUBJECT
            </span>
            <span className="text-slate-400">+</span>
            <span className="bg-sky-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xs">
              COMPLEMENT
            </span>
            <span className="text-slate-400">+</span>
            <span className="bg-rose-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xs">
              ?
            </span>
          </div>

          {spanishHelp && (
            <div className="text-xs sm:text-sm text-slate-300 mt-4 max-w-xl mx-auto font-medium">
              Palabra WH + Verbo To Be (am/is/are) + Sujeto (I/you/he/she...) + Complemento + Signo de interrogación
            </div>
          )}
        </div>

        {/* Formula Examples Grid */}
        <h4 className="text-lg font-bold text-slate-900 mb-3">
          Formula in Action:
        </h4>
        <div className="space-y-3">
          {[
            { wh: 'What', verb: 'is', subject: 'your name', comp: '', full: 'What is your name?' },
            { wh: 'Where', verb: 'are', subject: 'you', comp: 'from', full: 'Where are you from?' },
            { wh: 'When', verb: 'is', subject: 'your birthday', comp: '', full: 'When is your birthday?' },
            { wh: 'Who', verb: 'is', subject: 'your teacher', comp: '', full: 'Who is your teacher?' },
            { wh: 'Why', verb: 'are', subject: 'you', comp: 'happy', full: 'Why are you happy?' },
            { wh: 'How', verb: 'are', subject: 'you', comp: '', full: 'How are you?' },
          ].map((ex, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-1.5 font-bold text-base sm:text-lg">
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{ex.wh}</span>
                <span className="text-slate-400">+</span>
                <span className="text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">{ex.verb}</span>
                <span className="text-slate-400">+</span>
                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded">{ex.subject}</span>
                {ex.comp && (
                  <>
                    <span className="text-slate-400">+</span>
                    <span className="text-sky-800 bg-sky-100 px-2 py-0.5 rounded">{ex.comp}</span>
                  </>
                )}
                <span className="text-rose-600 font-black">?</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-base font-extrabold text-slate-800">
                  {ex.full}
                </span>
                <button
                  onClick={() => speakText(ex.full)}
                  type="button"
                  className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title="Listen question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. YES/NO vs WH-QUESTIONS & SHORT ANSWERS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Answers: YES/NO Questions vs. WH-Questions
        </h3>
        <p className="text-slate-600 text-sm sm:text-base font-medium mb-6">
          Understanding the difference between simple confirmation and requesting information:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* YES/NO Column */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-800 uppercase">
                YES / NO Questions
              </span>
            </div>
            <p className="text-sm text-slate-700 font-medium">
              These start with the verb <span className="font-bold">TO BE</span> and can be answered simply with Yes or No:
            </p>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-sm font-semibold">
              <p className="text-slate-800">
                <span className="font-bold text-indigo-700">Question:</span> Are you a SENA apprentice?
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1 font-mono text-xs sm:text-sm">
                <div className="text-emerald-700 font-bold">
                  Yes, + subject + TO BE: <span className="font-normal font-sans">"Yes, I am."</span>
                </div>
                <div className="text-rose-700 font-bold">
                  No, + subject + TO BE + not: <span className="font-normal font-sans">"No, I am not."</span>
                </div>
              </div>
            </div>
          </div>

          {/* WH-Questions Column */}
          <div className="bg-emerald-50/60 rounded-xl p-5 border-2 border-emerald-200 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white uppercase">
                WH-Questions (Information)
              </span>
            </div>
            <p className="text-sm text-slate-800 font-medium">
              WH-questions <span className="font-bold underline decoration-emerald-500">cannot</span> be answered with simply Yes or No. The answer normally provides specific information!
            </p>
            <div className="bg-white p-3.5 rounded-lg border border-emerald-200 space-y-2 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <p className="text-slate-900">
                  <span className="font-bold text-emerald-700">Question:</span> Where are you from?
                </p>
                <button
                  onClick={() => speakText("Where are you from?")}
                  className="text-slate-500 hover:text-emerald-700 p-1"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <p className="text-emerald-900 font-bold">
                  Answer: <span className="font-normal text-slate-800">I am from Colombia.</span>
                </p>
                <button
                  onClick={() => speakText("I am from Colombia.")}
                  className="text-slate-500 hover:text-emerald-700 p-1"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {spanishHelp && (
              <p className="text-xs text-emerald-900 italic">
                💡 Nota: En las preguntas WH nunca respondas solo con "Yes" o "No". Siempre brinda la información solicitada (lugar, nombre, fecha, etc.).
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. VISUAL EXAMPLES BY SUBJECT PRONOUN (WITH SHOW EXAMPLE) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Conjugation & Questions by Subject Pronoun
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Click <span className="font-bold text-emerald-700">"Show Example"</span> to reveal additional contextual examples for each pronoun.
            </p>
          </div>
          <Sparkles className="w-6 h-6 text-amber-500 shrink-0 hidden sm:block" />
        </div>

        {/* Pronouns list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {PRONOUN_CONJUGATIONS.map((item) => {
            const isExpanded = !!expandedPronouns[item.pronoun];
            return (
              <div
                key={item.pronoun}
                className="border-2 border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-slate-50/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Pronoun Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-2xs">
                        {item.pronoun}
                      </span>
                      <span className="text-lg font-extrabold text-indigo-700 uppercase">
                        {item.verb}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.spanish}
                    </span>
                  </div>

                  {/* Primary Sample */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-800">
                        {item.sampleQuestion}
                      </span>
                      <button
                        onClick={() => speakText(item.sampleQuestion)}
                        className="text-slate-400 hover:text-emerald-700 p-1"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 pl-2 border-l-2 border-emerald-500 font-medium">
                      ↳ {item.sampleAnswer}
                    </p>
                  </div>

                  {/* Expandable Extra Examples */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 bg-white p-3 rounded-lg border">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Additional Examples:
                      </span>
                      {item.moreExamples.map((ex, i) => (
                        <div key={i} className="text-xs space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>Q: {ex.question}</span>
                            <button
                              onClick={() => speakText(ex.question)}
                              className="text-slate-400 hover:text-emerald-700 p-0.5"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-600 pl-2 border-l border-indigo-400">
                            A: {ex.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Show/Hide Example Button */}
                <button
                  onClick={() => togglePronoun(item.pronoun)}
                  type="button"
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Extra Examples' : 'Show Example'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA to next section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-base sm:text-lg">Ready to see practical questions?</p>
            <p className="text-xs sm:text-sm text-slate-400">Explore general knowledge questions in Section 2.</p>
          </div>
        </div>
        <button
          onClick={() => {
            handleMarkComplete();
            onNextSection();
          }}
          type="button"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer text-base"
        >
          <span>Continue to 2. Examples</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
