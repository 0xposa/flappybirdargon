import React from 'react';
import { GAME_MODES } from '../game/rules';
import { GameModeId } from '../game/types';

interface GameHudProps {
  score: number;
  bestScore: number;
  combo: number;
  dashCharges: number;
  maxDashCharges: number;
  dashRechargeProgress: number;
  mode: GameModeId;
  graceTimer: number;
  isMuted: boolean;
  onTriggerDash: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  score,
  bestScore,
  combo,
  dashCharges,
  maxDashCharges,
  dashRechargeProgress,
  mode,
  graceTimer,
  isMuted,
  onTriggerDash,
  onToggleMute,
  onPause,
  onRestart,
}) => {
  const modeName = GAME_MODES[mode].name;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      {/* Top Perimeter Bar: 3 Compact Corner/Center Clusters */}
      <div className="flex items-start justify-between w-full max-w-7xl mx-auto gap-4">
        {/* Top-Left Cluster: Feather Dash Pips & Best/Combo */}
        <div className="flex flex-col items-start gap-2">
          <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#0B132B]/88 border-2 border-slate-700/90 shadow-[0_5px_0_#050814]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-sky-300 uppercase">
                SELUNCUR ANGIN [SHIFT]
              </span>
              <div className="flex items-center gap-1.5 mt-1" aria-label={`Muatan Seluncur Angin: ${dashCharges} dari ${maxDashCharges}`}>
                {Array.from({ length: maxDashCharges }).map((_, idx) => {
                  const isFull = idx < dashCharges;
                  const isRecharging = idx === dashCharges && dashRechargeProgress > 0;
                  return (
                    <svg
                      key={idx}
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      aria-hidden="true"
                    >
                      {/* Outer dark silhouette */}
                      <path
                        d="M20.2 3.8c-3.2-.4-7.5 1.2-10.8 4.5-2.6 2.6-4.1 5.6-4.4 8.2l-2.2 2.2 1.4 1.4 2.2-2.2c2.6-.3 5.6-1.8 8.2-4.4 3.3-3.3 4.9-7.6 4.5-10.8z"
                        fill={
                          isFull
                            ? '#38BDF8'
                            : isRecharging
                            ? '#0284C7'
                            : '#1E293B'
                        }
                        stroke="#090D16"
                        strokeWidth="2.2"
                      />
                      {/* Top highlight / interior detail */}
                      {isFull && (
                        <path
                          d="M17.5 6.5L8.5 15.5"
                          stroke="#E0F2FE"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      )}
                      {isRecharging && (
                        <circle cx="12" cy="12" r="3" fill="#FBBF24" />
                      )}
                    </svg>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              tabIndex={-1}
              disabled={dashCharges <= 0}
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                onTriggerDash();
              }}
              className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs border-2 transition-transform cursor-pointer whitespace-nowrap shrink-0 ${
                dashCharges > 0
                  ? 'bg-sky-400 text-slate-950 border-slate-950 hover:bg-sky-300 active:translate-y-0.5 shadow-[0_3px_0_#0369A1]'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              Luncur
            </button>
          </div>

          {/* Secondary Compact Readout: Best Score & Active Combo */}
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-100 hud-kicker-stroke px-1">
            <span>{modeName}</span>
            <span aria-hidden="true">·</span>
            <span>REKOR {Math.round(bestScore)}</span>
            {combo > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300">KOMBO x{Math.round(combo)}</span>
              </>
            )}
          </div>
        </div>

        {/* Top-Center Cluster: Hero Score Readout (~3:1 Scale to Kicker) */}
        <div className="flex flex-col items-center select-none" aria-live="polite">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-amber-300 hud-kicker-stroke uppercase">
            SKOR
          </span>
          <span
            data-testid="hud-score"
            className="font-display font-black text-5xl sm:text-6xl text-white font-mono-num hud-text-stroke leading-none mt-0.5"
          >
            {Math.round(score)}
          </span>
        </div>

        {/* Top-Right Cluster: Compact Utility Controls (Mute [M], Pause [P], Restart [R]) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            tabIndex={-1}
            aria-label={isMuted ? 'Nyalakan Suara [M]' : 'Matikan Suara [M]'}
            title="Suara [M]"
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0B132B]/90 border-2 border-slate-700 text-slate-200 hover:border-amber-400 hover:text-white active:translate-y-0.5 shadow-[0_4px_0_#050814] cursor-pointer"
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Ulangi Permainan [R]"
            title="Ulangi [R]"
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              onRestart();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0B132B]/90 border-2 border-slate-700 text-slate-200 hover:border-amber-400 hover:text-white active:translate-y-0.5 shadow-[0_4px_0_#050814] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Jeda Permainan [P]"
            title="Jeda [P]"
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              onPause();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0B132B]/90 border-2 border-slate-700 text-slate-200 hover:border-amber-400 hover:text-white active:translate-y-0.5 shadow-[0_4px_0_#050814] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Opening Grace Prompt (Auto-hides on first flap or after 2.1s) */}
      {graceTimer > 0.1 && (
        <div className="mx-auto mb-10 px-4 py-2 rounded-xl bg-[#0B132B]/85 border border-amber-400/60 text-center">
          <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide">
            Tekan Spasi atau Klik Layar untuk Mengepakkan Sayap
          </p>
        </div>
      )}
    </div>
  );
};
