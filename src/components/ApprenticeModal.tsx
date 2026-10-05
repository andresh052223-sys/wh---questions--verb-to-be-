import React, { useState } from 'react';
import { User, BookOpen, Check, Award } from 'lucide-react';
import { ApprenticeProfile } from '../types';
import { sound } from '../utils/audio';

interface ApprenticeModalProps {
  isOpen: boolean;
  currentProfile: ApprenticeProfile;
  onSave: (profile: ApprenticeProfile) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const ApprenticeModal: React.FC<ApprenticeModalProps> = ({
  isOpen,
  currentProfile,
  onSave,
  onClose,
  isInitialSetup = false,
}) => {
  const [name, setName] = useState(currentProfile.name || '');
  const [program, setProgram] = useState(currentProfile.program || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!program.trim()) {
      setError('Por favor ingresa tu programa de formación.');
      return;
    }

    sound.playSuccess();
    onSave({
      name: name.trim(),
      program: program.trim(),
      registeredAt: currentProfile.registeredAt || new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            SENA Bilingüismo
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isInitialSetup ? '¡Bienvenido Aprendiz!' : 'Perfil del Aprendiz'}
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Ingresa tus datos para personalizar tus actividades y generar tu informe en PDF con tus resultados.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Nombre Completo del Aprendiz:
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Ej. Juan Carlos Pérez Gómez"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-bold text-base outline-none transition-all placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Programa de Formación:
            </label>
            <div className="relative">
              <BookOpen className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={program}
                onChange={(e) => {
                  setProgram(e.target.value);
                  setError('');
                }}
                placeholder="Ej. Análisis y Desarrollo de Software (ADSO)"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-bold text-base outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            {!isInitialSetup && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm text-base cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>{isInitialSetup ? 'Comenzar Taller' : 'Guardar Datos'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
