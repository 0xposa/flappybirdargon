import React from 'react';
import { BIRD_SKINS, GAME_MODES, calculateMedal } from '../game/rules';
import { BirdSkinId, GameModeId } from '../game/types';

interface TitleScreenProps {
  selectedMode: GameModeId;
  selectedSkin: BirdSkinId;
  bestScore: number;
  isMuted: boolean;
  onSelectMode: (mode: GameModeId) => void;
  onSelectSkin: (skin: BirdSkinId) => void;
  onToggleMute: () => void;
  onStartGame: () => void;
}

const SKIN_LIST: BirdSkinId[] = ['canary', 'phoenix', 'emerald', 'phantom'];
const MODE_LIST: GameModeId[] = ['classic', 'zen', 'storm'];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedMode,
  selectedSkin,
  bestScore,
  isMuted,
  onSelectMode,
  onSelectSkin,
  onToggleMute,
  onStartGame,
}) => {
  const bestMedal = calculateMedal(bestScore);

  const medalLabel: Record<string, string> = {
    none: 'Belum Ada Medali',
    bronze: 'Medali Perunggu',
    silver: 'Medali Perak',
    gold: 'Medali Emas',
    platinum: 'Medali Platina',
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-5 sm:p-8 pointer-events-none">
      {/* Top Bar: Sound toggle & Personal Record */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div
          className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-amber-400/40 bg-[#0B132B]/90 shadow-[0_6px_0_#050814]"
          aria-label="Rekor tertinggi"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 shrink-0"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              fill={bestScore >= 25 ? '#FBBF24' : bestScore >= 12 ? '#E2E8F0' : bestScore >= 5 ? '#D97706' : '#334155'}
              stroke="#090D16"
              strokeWidth="2"
            />
            <path
              d="M12 7l1.5 3.1 3.4.5-2.5 2.4.6 3.4L12 14.8l-3 1.6.6-3.4-2.5-2.4 3.4-.5L12 7z"
              fill="#090D16"
            />
          </svg>
          <div className="flex items-baseline gap-2 text-xs text-slate-300">
            <span className="font-semibold tracking-wider text-amber-300">REKOR</span>
            <span className="font-mono-num text-lg font-bold text-white">
              {Math.round(bestScore)}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300">{medalLabel[bestMedal]}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-slate-700 bg-[#0B132B]/90 text-slate-200 hover:border-amber-400 hover:text-white transition-transform active:translate-y-0.5 shadow-[0_4px_0_#050814] cursor-pointer whitespace-nowrap shrink-0"
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
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
          <span className="text-xs font-semibold">{isMuted ? 'Suara Mati' : 'Suara Aktif'}</span>
        </button>
      </div>

      {/* Main Asymmetric Center-Right Stage Lockup (Leaving Left/Center Bird Showcase Clear) */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto">
        {/* Left column kept 100% open so live parallax sky & hovering bird remain unobstructed */}
        <div className="hidden lg:block lg:col-span-5 pointer-events-none" />

        {/* Right / Main Title & Hangar Card */}
        <div className="lg:col-span-7 pointer-events-auto bg-[#0B132B]/92 border-2 border-amber-400/60 rounded-2xl p-5 sm:p-7 shadow-[0_12px_0_#050814,0_24px_48px_rgba(0,0,0,0.75)]">
          {/* Custom Inline SVG Title Emblem Lockup */}
          <div className="flex flex-col items-center sm:items-start mb-5">
            <svg
              viewBox="0 0 520 96"
              className="w-full max-w-[440px] h-auto overflow-visible"
              role="img"
              aria-label="Kepak Langit: Ekspedisi Awan"
            >
              {/* Wing Crest Silhouette */}
              <path
                d="M12 48 C34 18, 72 16, 98 34 C72 32, 48 42, 26 60 Z"
                fill="#F59E0B"
                stroke="#090D16"
                strokeWidth="3"
              />
              <path
                d="M28 62 C50 40, 80 38, 104 50 C80 52, 56 60, 38 74 Z"
                fill="#FDE047"
                stroke="#090D16"
                strokeWidth="2.5"
              />
              {/* Main Display Title Text */}
              <text
                x="114"
                y="54"
                fontFamily="Outfit, sans-serif"
                fontWeight="900"
                fontSize="46"
                fill="#FEF08A"
                stroke="#090D16"
                strokeWidth="8"
                style={{ paintOrder: 'stroke fill', letterSpacing: '0.02em' }}
              >
                KEPAK LANGIT
              </text>
              <text
                x="116"
                y="82"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="700"
                fontSize="15"
                fill="#38BDF8"
                stroke="#090D16"
                strokeWidth="4"
                style={{ paintOrder: 'stroke fill', letterSpacing: '0.16em' }}
              >
                EKSPEDISI AWAN · EDISI ARKADE
              </text>
            </svg>
          </div>

          {/* Mode Selection */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>PILIH MODE TERBANG</span>
              <span className="text-amber-300">{GAME_MODES[selectedMode].subtitle}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {MODE_LIST.map((modeId) => {
                const mode = GAME_MODES[modeId];
                const active = selectedMode === modeId;
                return (
                  <button
                    key={modeId}
                    type="button"
                    onClick={() => onSelectMode(modeId)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-left transition-transform cursor-pointer ${
                      active
                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-[0_4px_0_#78350F]'
                        : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-display font-bold text-sm whitespace-nowrap truncate">
                      {mode.name}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5 whitespace-nowrap truncate">
                      {mode.maxDashCharges}x Seluncur · Celah {mode.pipeGap}px
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bird Skin Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>PILIH PENJELAJAH SAYAP</span>
              <span className="text-sky-300">{BIRD_SKINS[selectedSkin].role}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SKIN_LIST.map((skinId) => {
                const skin = BIRD_SKINS[skinId];
                const active = selectedSkin === skinId;
                return (
                  <button
                    key={skinId}
                    type="button"
                    onClick={() => onSelectSkin(skinId)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-transform cursor-pointer ${
                      active
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_4px_0_#0369A1]'
                        : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border-2 border-slate-950 shrink-0"
                      style={{ backgroundColor: skin.primaryColor }}
                    />
                    <span className="text-xs font-bold whitespace-nowrap truncate">
                      {skin.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Start Action */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartGame();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-slate-950 font-display font-black text-lg tracking-wide border-2 border-slate-950 shadow-[0_6px_0_#78350F] transition-all cursor-pointer whitespace-nowrap text-center"
            >
              MULAI TERBANG
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 pt-1">
              <span>Lewati Cincin Emas untuk Skor +2</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-300">Isi Ulang Seluncur Angin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Margin: Flat Borderless Control Hint */}
      <div className="w-full text-center pointer-events-none">
        <p className="text-xs sm:text-sm font-semibold text-slate-100 hud-kicker-stroke tracking-wide">
          Spasi / Klik Kepak Sayap · Shift / E Seluncur Angin · P Jeda Permainan
        </p>
      </div>
    </div>
  );
};
