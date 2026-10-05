import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Volume2,
  Clock,
  AlertTriangle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { MATCHING_SETS } from '../data/learningData';
import { MatchingPair, MatchingSet } from '../types';
import { sound, speakText } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ActivityTwoProps {
  onUpdateResults: (correctSets: number, totalSets: number, scorePercent: number) => void;
  onGoToResults: () => void;
  savedCompletedSets?: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SET_TIME_LIMIT = 60; // 1 minute (60s)
const TOTAL_SETS_COUNT = 10;
const STORAGE_APPROVED_SETS_KEY = 'sena_wh_approved_matching_indices';

export const ActivityTwoMatching: React.FC<ActivityTwoProps> = ({
  onUpdateResults,
  onGoToResults,
  savedCompletedSets = 0,
}) => {
  // Set of approved activity indices (0 to 9) loaded from localStorage
  const [approvedIndices, setApprovedIndices] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_APPROVED_SETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    // Fallback based on savedCompletedSets
    if (savedCompletedSets > 0) {
      return Array.from({ length: savedCompletedSets }, (_, i) => i);
    }
    return [];
  });

  // Current matching activity index (0 to 9)
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_APPROVED_SETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length < 10) {
          // Resume at the first uncompleted set
          return parsed.length;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const currentSet: MatchingSet = MATCHING_SETS[currentActivityIndex] || MATCHING_SETS[0];

  // Questions and shuffled answers
  const [questions, setQuestions] = useState<MatchingPair[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<MatchingPair[]>([]);

  // Selected question (turns green)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Successfully matched pairs in current activity: questionId -> answerId
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});

  // Failure state: when user picks wrong option or runs out of time
  const [errorState, setErrorState] = useState<{
    questionId: string;
    answerId: string;
    message: string;
  } | null>(null);

  // 1-minute countdown timer (60s)
  const [timeLeft, setTimeLeft] = useState<number>(SET_TIME_LIMIT);
  const isCurrentActivityApproved = approvedIndices.includes(currentActivityIndex);
  const [isActivityCompleted, setIsActivityCompleted] = useState<boolean>(isCurrentActivityApproved);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for drawing SVG connecting lines
  const containerRef = useRef<HTMLDivElement | null>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const answerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>>([]);

  // Initialize or repeat current set
  const initSet = useCallback((setIndex: number) => {
    const targetSet = MATCHING_SETS[setIndex] || MATCHING_SETS[0];
    setQuestions(targetSet.pairs);
    setShuffledAnswers(shuffleArray(targetSet.pairs));
    setSelectedQuestionId(null);
    setMatchedPairs({});
    setErrorState(null);
    setIsActivityCompleted(false);
    setTimeLeft(SET_TIME_LIMIT);
    setLines([]);
  }, []);

  useEffect(() => {
    initSet(currentActivityIndex);
  }, [currentActivityIndex, initSet]);

  // Timer countdown hook (1 minute)
  useEffect(() => {
    // Only tick when not completed and not in error state
    if (isActivityCompleted || errorState !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActivityCompleted, errorState, currentActivityIndex]);

  // Handle 1-minute time expired -> Stop and show repeat button!
  const handleTimeExpired = () => {
    sound.playError();
    setErrorState({
      questionId: '',
      answerId: '',
      message: '¡Se agotó el minuto de tiempo para esta actividad!',
    });
  };

  // Recalculate SVG lines
  const updateConnectingLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }> = [];

    Object.entries(matchedPairs).forEach(([qId, aId]) => {
      const qEl = questionRefs.current[qId];
      const aEl = answerRefs.current[aId];
      if (qEl && aEl) {
        const qRect = qEl.getBoundingClientRect();
        const aRect = aEl.getBoundingClientRect();

        const isSideBySide = qRect.right < aRect.left;

        if (isSideBySide) {
          newLines.push({
            id: `${qId}-${aId}`,
            x1: qRect.right - containerRect.left,
            y1: qRect.top + qRect.height / 2 - containerRect.top,
            x2: aRect.left - containerRect.left,
            y2: aRect.top + aRect.height / 2 - containerRect.top,
          });
        } else {
          newLines.push({
            id: `${qId}-${aId}`,
            x1: qRect.left + qRect.width / 2 - containerRect.left,
            y1: qRect.bottom - containerRect.top,
            x2: aRect.left + aRect.width / 2 - containerRect.left,
            y2: aRect.top - containerRect.top,
          });
        }
      }
    });

    setLines(newLines);
  }, [matchedPairs]);

  useLayoutEffect(() => {
    updateConnectingLines();
    window.addEventListener('resize', updateConnectingLines);
    return () => window.removeEventListener('resize', updateConnectingLines);
  }, [matchedPairs, updateConnectingLines]);

  // Click on a Question: turns GREEN
  const handleSelectQuestion = (qId: string) => {
    if (isActivityCompleted || errorState !== null) return;
    if (matchedPairs[qId]) return;

    sound.playClick();
    if (selectedQuestionId === qId) {
      setSelectedQuestionId(null);
    } else {
      setSelectedQuestionId(qId);
    }
  };

  // Click on an Answer: validates match
  const handleSelectAnswer = (aId: string) => {
    if (isActivityCompleted || errorState !== null) return;
    if (Object.values(matchedPairs).includes(aId)) return;

    if (!selectedQuestionId) {
      sound.playClick();
      return;
    }

    // Check if the answer matches the selected question
    if (selectedQuestionId === aId) {
      // CORRECT! Both become green and connect with a line
      sound.playSuccess();
      const updatedPairs = {
        ...matchedPairs,
        [selectedQuestionId]: aId,
      };
      setMatchedPairs(updatedPairs);
      setSelectedQuestionId(null);

      // Check if all 5 are completed in this activity
      if (Object.keys(updatedPairs).length === 5) {
        setIsActivityCompleted(true);
        // Add to approved indices if not already
        const updatedApproved = approvedIndices.includes(currentActivityIndex)
          ? approvedIndices
          : [...approvedIndices, currentActivityIndex];

        setApprovedIndices(updatedApproved);
        try {
          localStorage.setItem(STORAGE_APPROVED_SETS_KEY, JSON.stringify(updatedApproved));
        } catch {
          // ignore
        }

        const scorePercent = Math.round((updatedApproved.length / TOTAL_SETS_COUNT) * 100);
        onUpdateResults(updatedApproved.length, TOTAL_SETS_COUNT, scorePercent);

        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
        });
      }
    } else {
      // INCORRECT!
      // Do NOT auto-advance or auto-reset silently.
      // Flash red and display the button to repeat this activity!
      sound.playError();
      setErrorState({
        questionId: selectedQuestionId,
        answerId: aId,
        message: '¡Te has equivocado en esta actividad!',
      });
    }
  };

  // Move to next matching activity (only when current is approved!)
  const handleNextActivity = () => {
    if (!isActivityCompleted) return;
    sound.playClick();
    if (currentActivityIndex < TOTAL_SETS_COUNT - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
    } else if (approvedIndices.length === TOTAL_SETS_COUNT) {
      onGoToResults();
    }
  };

  // Switch tabs (only unlocked activities allowed)
  const handleSelectActivityTab = (idx: number) => {
    // Only allow if it's already approved OR it's the next activity to approve
    const isUnlocked = idx === 0 || approvedIndices.includes(idx) || idx <= approvedIndices.length;
    if (!isUnlocked) {
      sound.playError();
      return;
    }
    sound.playClick();
    setCurrentActivityIndex(idx);
  };

  const matchedCount = Object.keys(matchedPairs).length;
  const allActivitiesApproved = approvedIndices.length === TOTAL_SETS_COUNT;

  // Disappearing time line calculation (60s)
  const timeBarPercent = (timeLeft / SET_TIME_LIMIT) * 100;
  const timeBarColor =
    timeLeft <= 10
      ? 'bg-rose-500'
      : timeLeft <= 25
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            Section 4 • 10 Matching Activities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            4. Activity 2 – Match the Questions and Answers
          </h2>
          <p className="text-slate-700 text-base sm:text-lg mt-1 font-semibold">
            Tap a question (turns green), then tap its correct answer to link them.
          </p>
        </div>
      </div>

      {/* 10 Activities Navigation Tabs with Lock Status */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>ACTIVIDADES DE MATCHING (DEBES APROBAR LAS 10 PARA VER RESULTADOS):</span>
          <span className="text-emerald-700 font-extrabold">
            Aprobadas: {approvedIndices.length} / 10
          </span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {MATCHING_SETS.map((set, idx) => {
            const isCurrent = currentActivityIndex === idx;
            const isApproved = approvedIndices.includes(idx);
            const isUnlocked = idx === 0 || isApproved || idx <= approvedIndices.length;

            return (
              <button
                key={set.id}
                onClick={() => handleSelectActivityTab(idx)}
                type="button"
                disabled={!isUnlocked}
                className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer text-center relative ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500'
                    : isApproved
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                    : isUnlocked
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
                title={!isUnlocked ? 'Debes aprobar las actividades anteriores para desbloquear esta' : undefined}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Act {idx + 1}</span>
                  {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />}
                  {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-400 inline" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Status Bar */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-bold text-slate-800">
            {currentSet.title}: Une las 5 parejas correctamente sin equivocarte para aprobar.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700">
          <span className="bg-slate-100 px-3 py-1.5 rounded-lg border">
            Emparejadas: {matchedCount} / 5
          </span>
          <button
            onClick={() => initSet(currentActivityIndex)}
            type="button"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-950 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
            title="Reiniciar esta actividad"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* EXPLICIT FAILURE NOTIFICATION BANNER WITH BUTTON TO REPEAT THIS ACTIVITY */}
      {errorState && (
        <div className="bg-rose-600 text-white rounded-2xl p-6 border-2 border-rose-700 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in shake">
          <div className="flex items-center gap-3.5">
            <AlertTriangle className="w-8 h-8 text-white shrink-0" />
            <div>
              <p className="text-xl font-black">{errorState.message}</p>
              <p className="text-xs sm:text-sm text-rose-100 mt-1">
                Para avanzar a la siguiente actividad debes responder todas las opciones de esta actividad de forma correcta.
              </p>
            </div>
          </div>

          {/* BUTTON TO REPEAT THIS SPECIFIC ACTIVITY */}
          <button
            onClick={() => initSet(currentActivityIndex)}
            type="button"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black bg-white text-rose-700 hover:bg-rose-50 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 shrink-0 cursor-pointer text-sm sm:text-base"
          >
            <RotateCcw className="w-5 h-5 text-rose-600" />
            <span>VOLVER A REPETIR ESTA ACTIVIDAD</span>
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {isActivityCompleted && (
        <div className="bg-emerald-600 text-white rounded-2xl p-5 border-2 border-emerald-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-200 shrink-0" />
            <div>
              <p className="text-xl font-black">¡Excelente! Actividad {currentActivityIndex + 1} Aprobada (5/5) ✓</p>
              <p className="text-xs sm:text-sm text-emerald-100 mt-0.5 font-medium">
                Has emparejado las 5 preguntas y respuestas correctamente.
              </p>
            </div>
          </div>
          {currentActivityIndex < TOTAL_SETS_COUNT - 1 ? (
            <button
              onClick={handleNextActivity}
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black bg-white text-emerald-950 hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer text-sm shrink-0"
            >
              <span>Continuar a Actividad {currentActivityIndex + 2}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : allActivitiesApproved ? (
            <button
              onClick={onGoToResults}
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black bg-white text-emerald-950 hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer text-sm shrink-0"
            >
              <span>Ver Resultados y PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      )}

      {/* DISAPPEARING TIME LINE RIGHT ABOVE THE QUESTIONS AND ANSWERS */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className={timeLeft <= 10 && !isActivityCompleted ? 'text-rose-600 animate-pulse' : 'text-slate-700'}>
              {errorState
                ? '¡Actividad detenida por error!'
                : isActivityCompleted
                ? '¡Actividad completada!'
                : `Tiempo restante: ${timeLeft}s`}
            </span>
          </div>
          <span className="text-slate-400 font-mono text-xs">{timeLeft} / 60s</span>
        </div>

        {/* Disappearing Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeBarColor}`}
            style={{ width: `${Math.max(0, timeBarPercent)}%` }}
          />
        </div>
      </div>

      {/* Main Interactive Matching Board with SVG Connecting Lines */}
      <div ref={containerRef} className="relative">
        {/* SVG Overlay for Green Connecting Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          {lines.map((l) => (
            <g key={l.id}>
              <line
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="#10b981"
                strokeWidth={8}
                strokeOpacity={0.25}
                strokeLinecap="round"
              />
              <line
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="#059669"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              <circle
                cx={(l.x1 + l.x2) / 2}
                cy={(l.y1 + l.y2) / 2}
                r={4}
                fill="#047857"
              />
            </g>
          ))}
        </svg>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-0">
          {/* LEFT COLUMN: QUESTIONS */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                PREGUNTAS (Toca para seleccionar)
              </span>
              <span className="text-xs text-slate-400 font-medium">Se colorea verde</span>
            </div>

            {questions.map((q, idx) => {
              const isSelected = selectedQuestionId === q.id;
              const isMatched = !!matchedPairs[q.id];
              const isError = errorState?.questionId === q.id;

              return (
                <div
                  key={q.id}
                  ref={(el) => { questionRefs.current[q.id] = el; }}
                  onClick={() => handleSelectQuestion(q.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isError
                      ? 'border-rose-600 bg-rose-600 text-white shadow-md'
                      : isMatched
                      ? 'border-emerald-600 bg-emerald-500 text-white shadow-sm'
                      : isSelected
                      ? 'border-emerald-600 bg-emerald-500 text-white shadow-md scale-[1.01] ring-4 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                        isMatched || isSelected || isError
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider block ${
                          isMatched || isSelected || isError ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {q.whWord}
                      </span>
                      <p className="text-base sm:text-lg font-black leading-snug">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(q.question);
                      }}
                      type="button"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isMatched || isSelected || isError
                          ? 'text-white hover:bg-emerald-600'
                          : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                      }`}
                      title="Escuchar"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {isMatched && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: ANSWERS */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                RESPUESTAS (Toca para conectar)
              </span>
              <span className="text-xs text-slate-400 font-medium">Se une con línea</span>
            </div>

            {shuffledAnswers.map((item, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D, E
              const isMatched = Object.values(matchedPairs).includes(item.id);
              const isError = errorState?.answerId === item.id;

              return (
                <div
                  key={item.id}
                  ref={(el) => { answerRefs.current[item.id] = el; }}
                  onClick={() => handleSelectAnswer(item.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isError
                      ? 'border-rose-600 bg-rose-600 text-white shadow-md'
                      : isMatched
                      ? 'border-emerald-600 bg-emerald-500 text-white shadow-sm'
                      : selectedQuestionId
                      ? 'border-dashed border-emerald-400 bg-white hover:border-emerald-600 hover:bg-emerald-50/60 text-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                        isMatched || isError
                          ? 'bg-white text-slate-900'
                          : 'bg-indigo-700 text-white'
                      }`}
                    >
                      {letter}
                    </span>
                    <div>
                      <p className="text-base sm:text-lg font-bold leading-snug">
                        {item.answer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(item.answer);
                      }}
                      type="button"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isMatched || isError
                          ? 'text-white hover:bg-emerald-600'
                          : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                      }`}
                      title="Escuchar"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {isMatched && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="text-sm font-semibold text-slate-700">
          Actividad {currentActivityIndex + 1} de {TOTAL_SETS_COUNT} • Total Aprobadas: {approvedIndices.length} / {TOTAL_SETS_COUNT}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* If there is an error, show repeat button */}
          {errorState && (
            <button
              onClick={() => initSet(currentActivityIndex)}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-base bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a Repetir Actividad</span>
            </button>
          )}

          {/* Next activity button (only visible when current activity is approved) */}
          {isActivityCompleted && currentActivityIndex < TOTAL_SETS_COUNT - 1 && (
            <button
              onClick={handleNextActivity}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-base bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
            >
              <span>Continuar a Actividad {currentActivityIndex + 2}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {/* Results button (ONLY visible when ALL 10 activities are approved!) */}
          {allActivitiesApproved ? (
            <button
              onClick={onGoToResults}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-base bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
            >
              <span>Ver Resultados y PDF</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : !isActivityCompleted && !errorState ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Aprueba todas las actividades para desbloquear Resultados y PDF</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
