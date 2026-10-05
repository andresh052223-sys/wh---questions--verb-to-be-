import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Volume2,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { ACTIVITY_1_QUESTIONS } from '../data/learningData';
import { ScrambleQuestion } from '../types';
import { sound, speakText } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ActivityOneProps {
  onUpdateResults: (correct: number, incorrect: number, total: number, scorePercent: number) => void;
  onNextSection: () => void;
  savedCorrect?: number;
  savedIncorrect?: number;
  savedIndex?: number;
  onSaveProgress?: (correct: number, incorrect: number, index: number) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const QUESTION_TIME_LIMIT = 20; // 20 seconds per question
const TOTAL_QUESTIONS_COUNT = 30; // 30 questions in total

interface WordChip {
  id: number;
  text: string;
}

export const ActivityOneOrganize: React.FC<ActivityOneProps> = ({
  onUpdateResults,
  onNextSection,
  savedCorrect = 0,
  savedIncorrect = 0,
  savedIndex = 0,
  onSaveProgress,
}) => {
  // Take 30 questions from bank
  const [questionList, setQuestionList] = useState<ScrambleQuestion[]>(() => {
    return ACTIVITY_1_QUESTIONS.slice(0, TOTAL_QUESTIONS_COUNT);
  });

  const [currentIndex, setCurrentIndex] = useState<number>(savedIndex || 0);
  const currentQuestion = questionList[currentIndex];

  const [availableWords, setAvailableWords] = useState<WordChip[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordChip[]>([]);

  // Validation state: 'idle' | 'correct' | 'incorrect' | 'timeup'
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect' | 'timeup'>('idle');
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState<number>(0);

  // 20-second timer per question
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Score statistics
  const [correctCount, setCorrectCount] = useState<number>(savedCorrect || 0);
  const [incorrectCount, setIncorrectCount] = useState<number>(savedIncorrect || 0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Initialize current question words
  useEffect(() => {
    if (!currentQuestion) return;
    const chips: WordChip[] = currentQuestion.words.map((w, idx) => ({
      id: idx,
      text: w,
    }));
    let shuffled = shuffleArray(chips);
    if (shuffled.every((w, i) => w.text === currentQuestion.words[i]) && shuffled.length > 2) {
      shuffled = shuffleArray(chips);
    }
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setStatus('idle');
    setAttemptsOnCurrent(0);
    setTimeLeft(QUESTION_TIME_LIMIT);
  }, [currentIndex, currentQuestion]);

  // Timer countdown hook (20 seconds)
  useEffect(() => {
    if (status !== 'idle' || isFinished) {
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
  }, [status, isFinished, currentIndex]);

  const handleTimeExpired = () => {
    sound.playError();
    setStatus('timeup');
    const newIncorrect = incorrectCount + 1;
    setIncorrectCount(newIncorrect);
    if (onSaveProgress) {
      onSaveProgress(correctCount, newIncorrect, currentIndex);
    }
  };

  // Select word
  const handleSelectWord = (word: WordChip) => {
    if (status === 'correct' || status === 'timeup') return;
    sound.playClick();
    setAvailableWords((prev) => prev.filter((w) => w.id !== word.id));
    setSelectedWords((prev) => [...prev, word]);
    if (status === 'incorrect') setStatus('idle');
  };

  // Unselect word
  const handleUnselectWord = (word: WordChip) => {
    if (status === 'correct' || status === 'timeup') return;
    sound.playClick();
    setSelectedWords((prev) => prev.filter((w) => w.id !== word.id));
    setAvailableWords((prev) => [...prev, word]);
    if (status === 'incorrect') setStatus('idle');
  };

  // Reset words
  const handleResetOrder = () => {
    if (status === 'correct' || status === 'timeup') return;
    sound.playClick();
    if (!currentQuestion) return;
    const chips: WordChip[] = currentQuestion.words.map((w, idx) => ({
      id: idx,
      text: w,
    }));
    setAvailableWords(shuffleArray(chips));
    setSelectedWords([]);
    setStatus('idle');
  };

  // Check answer
  const handleCheckAnswer = () => {
    if (selectedWords.length === 0 || status === 'timeup') return;

    const constructed = selectedWords.map((w) => w.text).join(' ').trim();
    const targetWithSpaces = currentQuestion.words.join(' ').trim();

    const isMatch = constructed.toLowerCase() === targetWithSpaces.toLowerCase();

    if (isMatch) {
      sound.playSuccess();
      setStatus('correct');
      let newCorrect = correctCount;
      if (attemptsOnCurrent === 0) {
        newCorrect = correctCount + 1;
        setCorrectCount(newCorrect);
      }
      if (onSaveProgress) {
        onSaveProgress(newCorrect, incorrectCount, currentIndex);
      }
      const spokenQuestion = currentQuestion.words.filter((w) => w !== '?').join(' ') + '?';
      speakText(spokenQuestion);
    } else {
      sound.playError();
      setStatus('incorrect');
      setAttemptsOnCurrent((prev) => prev + 1);
      let newIncorrect = incorrectCount;
      if (attemptsOnCurrent === 0) {
        newIncorrect = incorrectCount + 1;
        setIncorrectCount(newIncorrect);
      }
      if (onSaveProgress) {
        onSaveProgress(correctCount, newIncorrect, currentIndex);
      }
    }
  };

  // Next question
  const handleNextQuestion = () => {
    sound.playClick();
    const nextIdx = currentIndex + 1;
    if (nextIdx < questionList.length) {
      setCurrentIndex(nextIdx);
      if (onSaveProgress) {
        onSaveProgress(correctCount, incorrectCount, nextIdx);
      }
    } else {
      setIsFinished(true);
      const finalScorePercent = Math.round((correctCount / TOTAL_QUESTIONS_COUNT) * 100);
      onUpdateResults(correctCount, incorrectCount, TOTAL_QUESTIONS_COUNT, finalScorePercent);
      if (finalScorePercent >= 70) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // Restart activity
  const handleRestartActivity = () => {
    sound.playClick();
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsFinished(false);
    setStatus('idle');
    setTimeLeft(QUESTION_TIME_LIMIT);
    if (onSaveProgress) {
      onSaveProgress(0, 0, 0);
    }
  };

  const scorePercent = questionList.length > 0 ? Math.round((correctCount / TOTAL_QUESTIONS_COUNT) * 100) : 0;

  // Disappearing time percentage (from 100% down to 0%)
  const timeBarPercent = (timeLeft / QUESTION_TIME_LIMIT) * 100;
  const timeBarColor =
    timeLeft <= 5
      ? 'bg-rose-500'
      : timeLeft <= 10
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  if (isFinished) {
    return (
      <div className="py-10 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-md">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            Activity 1 Completed (30 Questions)
          </span>

          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
            Challenge Completed!
          </h3>

          <p className="text-slate-600 text-lg mt-2">
            You completed all 30 timed WH-questions with 20 seconds per question.
          </p>

          <div className="grid grid-cols-3 gap-4 my-8 max-w-md mx-auto">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Correct</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{correctCount}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Timeouts / Errors</span>
              <p className="text-3xl font-extrabold text-rose-500 mt-1">{incorrectCount}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Score</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{scorePercent}%</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRestartActivity}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-white text-slate-800 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
            <button
              onClick={onNextSection}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm text-base"
            >
              <span>Go to Activity 2: Matching</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            Section 3 • Timed Challenge (20s)
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            3. Activity 1 – Put the Question in Order
          </h2>
          <p className="text-slate-700 text-base sm:text-lg mt-1 font-semibold">
            Read the question in Spanish. Then organize the English words to create the correct WH-question with TO BE.
          </p>
        </div>
      </div>

      {/* Metrics Bar: Score, Question X/30, Correct, Incorrect, Progress Bar */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Question</span>
            <p className="text-xl font-extrabold text-slate-900">{currentIndex + 1} / {TOTAL_QUESTIONS_COUNT}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-emerald-600 uppercase">Correct</span>
            <p className="text-xl font-extrabold text-emerald-700">{correctCount}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-rose-500 uppercase">Incorrect</span>
            <p className="text-xl font-extrabold text-rose-600">{incorrectCount}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase">Score</span>
            <p className="text-xl font-extrabold text-indigo-700">{scorePercent}%</p>
          </div>
        </div>

        {/* Linear Progress Bar for 30 questions */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Overall Activity Progress</span>
            <span>{Math.round(((currentIndex) / TOTAL_QUESTIONS_COUNT) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-800 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / TOTAL_QUESTIONS_COUNT) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        {/* Category badge & Question Prompt in Spanish */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md">
              Context: {currentQuestion.category}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Tiempo: 20 segundos
            </span>
          </div>

          {/* SPANISH QUESTION CARD */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 text-center shadow-xs">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block mb-2">
              Spanish Question:
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              "{currentQuestion.spanish}"
            </h3>
          </div>

          {/* DISAPPEARING TIME BAR RIGHT BELOW THE SPANISH QUESTION */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs font-black">
              <span className={`transition-colors ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
                {status === 'timeup'
                  ? '¡Tiempo agotado!'
                  : status === 'correct'
                  ? '¡Respuesta correcta!'
                  : `Tiempo restante: ${timeLeft}s`}
              </span>
              <span className="text-slate-400 font-mono">{timeLeft} / 20s</span>
            </div>

            {/* The Disappearing Bar */}
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeBarColor}`}
                style={{ width: `${Math.max(0, timeBarPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Selected Words Tray */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Your English Question:
            </span>
            {selectedWords.length > 0 && status !== 'correct' && status !== 'timeup' && (
              <button
                onClick={handleResetOrder}
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset words</span>
              </button>
            )}
          </div>

          <div
            className={`min-h-[90px] sm:min-h-[110px] p-4 sm:p-6 rounded-2xl border-2 border-dashed flex flex-wrap items-center gap-2.5 sm:gap-3 transition-all ${
              status === 'correct'
                ? 'border-emerald-500 bg-emerald-50/70'
                : status === 'incorrect' || status === 'timeup'
                ? 'border-rose-400 bg-rose-50/60'
                : selectedWords.length > 0
                ? 'border-slate-400 bg-slate-50'
                : 'border-slate-300 bg-slate-50/50 justify-center'
            }`}
          >
            {selectedWords.length === 0 ? (
              <p className="text-sm sm:text-base font-semibold text-slate-400 text-center">
                Tap words below in the correct order to construct the question...
              </p>
            ) : (
              selectedWords.map((word) => (
                <button
                  key={`selected-${word.id}`}
                  onClick={() => handleUnselectWord(word)}
                  disabled={status === 'correct' || status === 'timeup'}
                  type="button"
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-extrabold text-base sm:text-xl shadow-xs transition-transform active:scale-95 cursor-pointer ${
                    status === 'correct'
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-white text-slate-900 border-2 border-slate-300 hover:border-rose-400 hover:bg-rose-50'
                  }`}
                  title={status === 'correct' ? undefined : 'Click to remove'}
                >
                  {word.text}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Available Words Pool */}
        <div>
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-3">
            Available Words:
          </span>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-h-[56px]">
            {availableWords.map((word) => (
              <button
                key={`available-${word.id}`}
                onClick={() => handleSelectWord(word)}
                disabled={status === 'correct' || status === 'timeup'}
                type="button"
                className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-black text-base sm:text-xl text-slate-900 bg-slate-100 hover:bg-emerald-50 border-2 border-slate-300 hover:border-emerald-500 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                {word.text}
              </button>
            ))}
            {availableWords.length === 0 && selectedWords.length > 0 && status === 'idle' && (
              <span className="text-xs text-slate-400 font-medium italic">
                All words selected. Ready to check!
              </span>
            )}
          </div>
        </div>

        {/* Immediate Visual Feedback Banner */}
        {status === 'correct' && (
          <div className="bg-emerald-600 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-200 shrink-0" />
              <div>
                <p className="text-xl font-black">Excellent! ✓</p>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5 font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
            <button
              onClick={() => speakText(currentQuestion.words.filter((w) => w !== '?').join(' ') + '?')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-800 text-white text-xs font-bold self-start sm:self-center transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen</span>
            </button>
          </div>
        )}

        {status === 'timeup' && (
          <div className="bg-rose-50 border-2 border-rose-400 text-rose-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in shadow-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
              <div>
                <p className="text-base sm:text-lg font-black">¡Tiempo agotado! (20 segundos)</p>
                <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
                  El orden correcto era: <span className="font-bold underline">{currentQuestion.words.join(' ')}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleRestartActivity}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm transition-colors cursor-pointer shadow-xs shrink-0 self-stretch sm:self-auto justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a Iniciar Actividad</span>
            </button>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in shake shadow-xs">
            <div className="flex items-center gap-3">
              <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
              <div>
                <p className="text-base sm:text-lg font-black">¡Respuesta incorrecta!</p>
                <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
                  Recuerda la estructura: <span className="font-bold">WH-word + verb TO BE + subject</span>. Puedes corregir el orden o reiniciar la actividad.
                </p>
              </div>
            </div>

            <button
              onClick={handleRestartActivity}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm transition-colors cursor-pointer shadow-xs shrink-0 self-stretch sm:self-auto justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a Iniciar Actividad</span>
            </button>
          </div>
        )}

        {/* Action Controls: Check Answer and Next Question */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Question {currentIndex + 1} of {TOTAL_QUESTIONS_COUNT}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {(status === 'incorrect' || status === 'timeup') && (
              <button
                onClick={handleRestartActivity}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-extrabold text-sm sm:text-base border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar Actividad 3</span>
              </button>
            )}

            {status !== 'correct' && status !== 'timeup' ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedWords.length === 0}
                type="button"
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-base sm:text-lg transition-all shadow-xs cursor-pointer ${
                  selectedWords.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
                }`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-base sm:text-lg bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
              >
                <span>{currentIndex + 1 < questionList.length ? 'Next Question' : 'See Results & PDF'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
