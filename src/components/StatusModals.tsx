import React from 'react';
import { GAME_MODES } from '../game/rules';
import { GameState, MedalTier, RunStatsSnapshot } from '../game/types';

interface StatusModalsProps {
  phase: GameState;
  score: number;
  bestScore: number;
  pipesCleared: number;
  snapshot: RunStatsSnapshot | null;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

const MEDAL_META: Record<
  MedalTier,
  { title: string; fill: string; rim: string; ribbon: string; nextHint: string }
> = {
  none: {
    title: 'Penjelajah Pemula',
    fill: '#334155',
    rim: '#64748B',
    ribbon: '#475569',
    nextHint: 'Capai skor 5 untuk Medali Perunggu',
  },
  bronze: {
    title: 'Medali Perunggu',
    fill: '#D97706',
    rim: '#FBBF24',
    ribbon: '#B45309',
    nextHint: 'Capai skor 12 untuk Medali Perak',
  },
  silver: {
    title: 'Medali Perak',
    fill: '#CBD5E1',
    rim: '#F8FAFC',
    ribbon: '#0284C7',
    nextHint: 'Capai skor 25 untuk Medali Emas',
  },
  gold: {
    title: 'Medali Emas',
    fill: '#F59E0B',
    rim: '#FEF08A',
    ribbon: '#DC2626',
    nextHint: 'Capai skor 40 untuk Medali Platina',
  },
  platinum: {
    title: 'Medali Platina Surya',
    fill: '#38BDF8',
    rim: '#E0F2FE',
    ribbon: '#7C3AED',
    nextHint: 'Penguasa Tertinggi Ekspedisi Awan!',
  },
};

export const StatusModals: React.FC<StatusModalsProps> = ({
  phase,
  score,
  bestScore,
  pipesCleared,
  snapshot,
  onResume,
  onRestart,
  onReturnTitle,
}) => {
  if (phase !== 'paused' && phase !== 'gameover') {
    return null;
  }

  if (phase === 'paused') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-modal-title"
        className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75"
      >
        <div className="w-full max-w-md rounded-2xl bg-[#0B132B] border-2 border-amber-400/70 p-6 sm:p-7 shadow-[0_12px_0_#050814,0_24px_48px_rgba(0,0,0,0.85)]">
          <p className="text-xs font-extrabold tracking-widest text-amber-300 uppercase">
            PERMAINAN DIJEDA
          </p>
          <h2
            id="pause-modal-title"
            className="font-display font-black text-3xl text-white mt-1"
          >
            Istirahat Sejenak
          </h2>

          {/* 3 Tabular Stat Tiles */}
          <div className="grid grid-cols-3 gap-3 my-6">
            <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase">SKOR</div>
              <div className="font-mono-num font-black text-2xl text-white mt-0.5">
                {Math.round(score)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase">REKOR</div>
              <div className="font-mono-num font-black text-2xl text-amber-300 mt-0.5">
                {Math.round(bestScore)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase">PILAR</div>
              <div className="font-mono-num font-black text-2xl text-sky-300 mt-0.5">
                {Math.round(pipesCleared)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-base border-2 border-slate-950 shadow-[0_5px_0_#78350F] transition-transform active:translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              Lanjutkan Terbang [P]
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onRestart}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border-2 border-slate-600 cursor-pointer whitespace-nowrap"
              >
                Ulangi [R]
              </button>
              <button
                type="button"
                onClick={onReturnTitle}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm border-2 border-slate-700 cursor-pointer whitespace-nowrap"
              >
                Layar Utama
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Over Modal
  const finalScore = snapshot ? snapshot.score : score;
  const finalBest = snapshot ? snapshot.bestScore : bestScore;
  const finalPipes = snapshot ? snapshot.pipesCleared : pipesCleared;
  const finalPerfect = snapshot ? snapshot.perfectPasses : 0;
  const isNewRecord = snapshot ? snapshot.isNewRecord : false;
  const medalTier: MedalTier = snapshot ? snapshot.medal : 'none';
  const medal = MEDAL_META[medalTier];
  const modeName = snapshot ? GAME_MODES[snapshot.mode].name : 'Ekspedisi Klasik';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-modal-title"
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0B132B] border-2 border-amber-400/80 p-6 sm:p-7 shadow-[0_12px_0_#050814,0_24px_48px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-widest text-amber-300 uppercase">
              PENERBANGAN BERAKHIR · {modeName}
            </p>
            <h2
              id="gameover-modal-title"
              className="font-display font-black text-2xl sm:text-3xl text-white mt-1 whitespace-nowrap"
            >
              {isNewRecord ? 'Rekor Baru Tercapai!' : 'Ringkasan Ekspedisi'}
            </h2>
          </div>

          {/* Code-Authored SVG Medal Insignia */}
          <div className="flex flex-col items-center shrink-0">
            <svg viewBox="0 0 64 64" className="w-16 h-16" aria-label={medal.title}>
              {/* Ribbon */}
              <path
                d="M20 6 L28 24 L36 24 L44 6 Z"
                fill={medal.ribbon}
                stroke="#090D16"
                strokeWidth="3"
              />
              {/* Outer Medal Disc */}
              <circle
                cx="32"
                cy="38"
                r="20"
                fill={medal.fill}
                stroke="#090D16"
                strokeWidth="3.5"
              />
              {/* Inner Rim */}
              <circle
                cx="32"
                cy="38"
                r="14"
                fill="none"
                stroke={medal.rim}
                strokeWidth="2"
              />
              {/* Star Center */}
              <path
                d="M32 27 l3.2 6.5 7.2 1 -5.2 5.1 1.2 7.2 -6.4-3.4 -6.4 3.4 1.2-7.2 -5.2-5.1 7.2-1 Z"
                fill={medal.rim}
                stroke="#090D16"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-[11px] font-bold text-amber-300 mt-1">
              {medal.title}
            </span>
          </div>
        </div>

        {/* 3 Tabular Stat Tiles */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase">SKOR AKHIR</div>
            <div
              data-testid="gameover-score"
              className="font-mono-num font-black text-3xl text-white mt-1"
            >
              {Math.round(finalScore)}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase">REKOR TERBAIK</div>
            <div className="font-mono-num font-black text-3xl text-amber-300 mt-1">
              {Math.round(finalBest)}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase">CINCIN EMAS</div>
            <div className="font-mono-num font-black text-3xl text-sky-300 mt-1">
              {Math.round(finalPerfect)}
            </div>
          </div>
        </div>

        {/* Progress Toward Goal Hint */}
        <div className="flex items-center gap-2 text-xs text-slate-300 px-1 mb-5">
          <span>Pilar Dilewati: {Math.round(finalPipes)}</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-200">{medal.nextHint}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            data-start="true"
            onClick={onRestart}
            className="flex-1 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-base tracking-wide border-2 border-slate-950 shadow-[0_5px_0_#78350F] transition-transform active:translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            Terbang Lagi [Spasi]
          </button>
          <button
            type="button"
            onClick={onReturnTitle}
            className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border-2 border-slate-600 cursor-pointer whitespace-nowrap"
          >
            Layar Utama
          </button>
        </div>
      </div>
    </div>
  );
};
