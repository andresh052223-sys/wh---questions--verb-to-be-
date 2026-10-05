import jsPDF from 'jspdf';
import { ApprenticeProfile, ApprenticeProgress } from '../types';

export function generateResultsPDF(
  profile: ApprenticeProfile,
  progress: ApprenticeProgress
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const act1Correct = progress.activity1Correct;
  const act1Total = 30;
  const act1Score = Math.round((act1Correct / act1Total) * 100);

  const act2Correct = progress.activity2Correct;
  const act2Total = 10;
  const act2Score = Math.round((act2Correct / act2Total) * 100);

  const overallScore = Math.round((act1Score + act2Score) / 2);

  let evalText = '';
  let evalTextEs = '';
  if (overallScore >= 90) {
    evalText = 'Excellent! You have a very good understanding of WH-questions with TO BE.';
    evalTextEs = '¡Excelente! Tienes un muy buen dominio de las preguntas WH con el verbo TO BE.';
  } else if (overallScore >= 70) {
    evalText = 'Good job! Keep practicing.';
    evalTextEs = '¡Buen trabajo! Sigue practicando.';
  } else {
    evalText = 'Keep practicing. Review the grammar section and try again.';
    evalTextEs = 'Sigue practicando. Repasa la sección de gramática e inténtalo de nuevo.';
  }

  // SENA Emerald Header Banner
  doc.setFillColor(5, 150, 105); // #059669 emerald
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SERVICIO NACIONAL DE APRENDIZAJE - SENA', pageWidth / 2, 13, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PROGRAMA DE BILINGÜISMO • ENGLISH LEVEL A1-A2', pageWidth / 2, 20, { align: 'center' });
  doc.text('INFORME OFICIAL DE RESULTADOS DE APRENDIZAJE', pageWidth / 2, 26, { align: 'center' });

  // Document Title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('WH-QUESTIONS WITH TO BE', pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Learn, practice and master WH-questions with the verb TO BE.', pageWidth / 2, 51, { align: 'center' });

  // Apprentice Profile Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 58, pageWidth - 30, 32, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DATOS DEL APRENDIZ / APPRENTICE PROFILE', 22, 66);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Nombre / Name:', 22, 74);
  doc.text('Programa / Program:', 22, 82);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name || 'Aprendiz SENA', 65, 74);
  doc.text(profile.program || 'Programa de Formación SENA', 65, 82);

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha de emisión: ${currentDate}`, pageWidth - 22, 82, { align: 'right' });

  // Results Breakdown Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('DETALLE DE ACTIVIDADES / EXERCISE BREAKDOWN', 15, 102);

  // Table header
  let y = 108;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y, pageWidth - 30, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVIDAD / SECCIÓN', 20, y + 6);
  doc.text('RESULTADO', 120, y + 6);
  doc.text('PUNTAJE', pageWidth - 25, y + 6, { align: 'right' });

  // Row 1: Grammar Review
  y += 9;
  doc.setFillColor(255, 255, 255);
  doc.rect(15, y, pageWidth - 30, 11, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y + 11, pageWidth - 15, y + 11);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Grammar Review (Reglas & Pronombres)', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text('Completado / Completed', 120, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.text('100%', pageWidth - 25, y + 7, { align: 'right' });

  // Row 2: Activity 1
  y += 11;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, y, pageWidth - 30, 11, 'F');
  doc.line(15, y + 11, pageWidth - 15, y + 11);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Activity 1 – Put Question in Order (30 preguntas)', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${act1Correct} de ${act1Total} correctas`, 120, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${act1Score}%`, pageWidth - 25, y + 7, { align: 'right' });

  // Row 3: Activity 2
  y += 11;
  doc.setFillColor(255, 255, 255);
  doc.rect(15, y, pageWidth - 30, 11, 'F');
  doc.line(15, y + 11, pageWidth - 15, y + 11);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Activity 2 – Matching Questions & Answers (10 actividades)', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${act2Correct} de ${act2Total} actividades logradas`, 120, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${act2Score}%`, pageWidth - 25, y + 7, { align: 'right' });

  // Overall Score Banner
  y += 18;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, y, pageWidth - 30, 26, 3, 3, 'F');

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PUNTAJE GLOBAL / OVERALL SCORE', 25, y + 11);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('Desempeño General del Taller', 25, y + 19);

  doc.setFontSize(26);
  doc.setTextColor(52, 211, 153);
  doc.text(`${overallScore}%`, pageWidth - 25, y + 17, { align: 'right' });

  // Evaluative Message Box
  y += 34;
  doc.setDrawColor(5, 150, 105);
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(15, y, pageWidth - 30, 30, 3, 3, 'FD');

  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('EVALUACIÓN PEDAGÓGICA / PERFORMANCE EVALUATION:', 22, y + 9);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(evalText, 22, y + 17);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(evalTextEs, 22, y + 24);

  // Signatures / Institutional verification section
  y += 42;
  const lineY = y + 20;
  // Apprentice signature line
  doc.setDrawColor(148, 163, 184);
  doc.line(25, lineY, 85, lineY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Firma del Aprendiz', 55, lineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(profile.name || 'Aprendiz', 55, lineY + 10, { align: 'center' });

  // Instructor signature line
  doc.line(pageWidth - 85, lineY, pageWidth - 25, lineY);
  doc.setFont('helvetica', 'normal');
  doc.text('Firma Instructor / Docente', pageWidth - 55, lineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Programa de Bilingüismo SENA', pageWidth - 55, lineY + 10, { align: 'center' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Este documento certifica el desarrollo de las actividades interactivas de formación en inglés en la plataforma SENA.', pageWidth / 2, 285, { align: 'center' });

  // Save the PDF
  const cleanName = (profile.name || 'Aprendiz').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Resultados_SENA_WH_Questions_${cleanName}.pdf`);
}
