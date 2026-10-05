import React, { useEffect, useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Award,
  Download,
  FileText,
  User,
  Edit3,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { ApprenticeProgress, ApprenticeProfile } from '../types';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { generateResultsPDF } from '../utils/pdfGenerator';

interface FinalResultsProps {
  progress: ApprenticeProgress;
  profile: ApprenticeProfile;
  onEditProfile: () => void;
  onTryAgain: () => void;
  onReviewGrammar: () => void;
  onGoToMatching?: () => void;
}

export const FinalResults: React.FC<FinalResultsProps> = ({
  progress,
  profile,
  onEditProfile,
  onTryAgain,
  onReviewGrammar,
  onGoToMatching,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Activity 1 stats (30 questions)
  const act1Correct = progress.activity1Correct;
  const act1Total = 30;
  const act1Score = Math.round((act1Correct / act1Total) * 100);

  // Activity 2 stats (10 matching activities)
  const act2Correct = progress.activity2Correct;
  const act2Total = 10;
  const act2Score = Math.round((act2Correct / act2Total) * 100);

  // Overall Score (Weighted 50% / 50%)
  const overallScore = Math.round((act1Score + act2Score) / 2);

  // If the apprentice has not approved all 10 matching activities, lock results!
  if (act2Correct < 10) {
    return (
      <div className="py-12 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-md space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-3xl mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-10 h-10" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            Sección Bloqueada
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Debes aprobar las 10 actividades de Matching
          </h2>

          <p className="text-slate-600 text-base font-medium max-w-md mx-auto">
            Para ver tus resultados finales y descargar tu informe PDF oficial, debes aprobar cada una de las 10 actividades de Matching sin errores.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-xs mx-auto">
            <span className="text-xs font-bold text-slate-500 uppercase">Actividades Aprobadas:</span>
            <p className="text-3xl font-black text-emerald-600 mt-0.5">
              {act2Correct} / 10
            </p>
          </div>

          <button
            onClick={onGoToMatching}
            type="button"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 mx-auto text-base"
          >
            <span>Ir a la Sección 4: Matching</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Determine Performance Message based on exact prompt specifications
  let performanceMessage = '';
  let performanceMessageEs = '';
  let badgeColor = '';

  if (overallScore >= 90) {
    performanceMessage = 'Excellent! You have a very good understanding of WH-questions with TO BE.';
    performanceMessageEs = '¡Excelente! Tienes un muy buen dominio de las preguntas WH con el verbo TO BE.';
    badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  } else if (overallScore >= 70) {
    performanceMessage = 'Good job! Keep practicing.';
    performanceMessageEs = '¡Buen trabajo! Sigue practicando.';
    badgeColor = 'text-indigo-700 bg-indigo-50 border-indigo-300';
  } else {
    performanceMessage = 'Keep practicing. Review the grammar section and try again.';
    performanceMessageEs = 'Sigue practicando. Repasa la sección de gramática e inténtalo de nuevo.';
    badgeColor = 'text-amber-800 bg-amber-50 border-amber-300';
  }

  useEffect(() => {
    if (overallScore >= 70) {
      sound.playSuccess();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [overallScore]);

  const handleDownloadPDF = () => {
    sound.playSuccess();
    setIsGenerating(true);
    try {
      generateResultsPDF(profile, progress);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          RESULTADOS Y PDF
        </h2>
        <p className="text-slate-600 text-lg font-medium">
          Informe de rendimiento oficial y descarga de certificado en PDF para aprendices SENA.
        </p>
      </div>

      {/* Main Results Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Apprentice Profile Card with Edit option */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white rounded-xl border border-slate-300 flex items-center justify-center text-emerald-700 shadow-2xs">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Aprendiz Registrado:
              </span>
              <p className="text-lg font-black text-slate-900">
                {profile.name || 'Aprendiz SENA'}
              </p>
              <p className="text-xs font-bold text-slate-600">
                {profile.program || 'Programa de Formación General'}
              </p>
            </div>
          </div>

          <button
            onClick={onEditProfile}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Datos</span>
          </button>
        </div>

        {/* Big PDF Download Banner */}
        <div className="bg-emerald-600 text-white rounded-2xl p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <FileText className="w-5 h-5 text-emerald-200" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-200">
                Informe Certificado SENA
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Descargar Informe en PDF
            </h3>
            <p className="text-emerald-100 text-sm max-w-md">
              Genera y descarga tu archivo PDF oficial con tus nombres, programa y puntajes detallados de todas las actividades.
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            type="button"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-base bg-white text-emerald-950 hover:bg-emerald-50 transition-all shadow-lg active:scale-98 flex items-center justify-center gap-3 cursor-pointer shrink-0"
          >
            <Download className="w-5 h-5 text-emerald-700" />
            <span>{isGenerating ? 'Generando PDF...' : 'DESCARGAR PDF'}</span>
          </button>
        </div>

        {/* Performance Evaluative Banner */}
        <div className={`p-6 rounded-2xl border-2 text-center space-y-1.5 ${badgeColor}`}>
          <div className="flex items-center justify-center gap-2">
            <Award className="w-6 h-6 shrink-0" />
            <span className="text-xs uppercase font-extrabold tracking-widest">
              Evaluación Pedagógica
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {performanceMessage}
          </p>
          <p className="text-sm sm:text-base font-semibold text-slate-700 italic pt-1">
            💡 {performanceMessageEs}
          </p>
        </div>

        {/* Breakdown List */}
        <div className="space-y-4">
          {/* Grammar Review Status */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-900">
                  Grammar Review
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Formulas, WH-words & subject pronouns
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-black text-sm sm:text-base bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span>Completed ✓</span>
            </div>
          </div>

          {/* Activity 1 Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-base sm:text-lg font-black text-slate-900">
                Activity 1: Put the Question in Order
              </p>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">
                Correct answers: <span className="font-extrabold text-slate-900">{act1Correct}/{act1Total}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Score:</span>
              <span className="text-2xl font-black text-slate-900 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                {act1Score}%
              </span>
            </div>
          </div>

          {/* Activity 2 Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-base sm:text-lg font-black text-slate-900">
                Activity 2: Match Questions and Answers
              </p>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">
                Completed activities: <span className="font-extrabold text-slate-900">{act2Correct}/{act2Total}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Score:</span>
              <span className="text-2xl font-black text-slate-900 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                {act2Score}%
              </span>
            </div>
          </div>

          {/* Overall Total Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Final Result
              </span>
              <p className="text-2xl sm:text-3xl font-black mt-0.5">
                Overall Score
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl sm:text-5xl font-black text-emerald-400">
                {overallScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Buttons: TRY AGAIN & REVIEW GRAMMAR */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onTryAgain}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-base sm:text-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={onReviewGrammar}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-base sm:text-lg bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 transition-all cursor-pointer active:scale-98"
          >
            <BookOpen className="w-5 h-5" />
            <span>REVIEW GRAMMAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
