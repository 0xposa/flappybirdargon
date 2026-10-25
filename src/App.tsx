import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud } from './components/GameHud';
import { StatusModals } from './components/StatusModals';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './game/audio';
import { CanvasWorldRenderer } from './game/renderer';
import {
  BIRD_SKINS,
  GAME_MODES,
  createInitialBird,
  createInitialRunState,
  startNewRun,
  stepPhysics,
  triggerFeatherDash,
  triggerFlap,
} from './game/rules';
import {
  BirdSkinId,
  GameModeId,
  GameRunState,
  GameState,
  RunStatsSnapshot,
} from './game/types';

const STORAGE_BEST_KEY = 'kepak_langit_best_score_v1';

interface HudViewState {
  phase: GameState;
  mode: GameModeId;
  skin: BirdSkinId;
  score: number;
  bestScore: number;
  pipesCleared: number;
  combo: number;
  dashCharges: number;
  maxDashCharges: number;
  dashRechargeProgress: number;
  graceActive: boolean;
  snapshot: RunStatsSnapshot | null;
}

function loadSavedBestScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_BEST_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number): void {
  try {
    localStorage.setItem(STORAGE_BEST_KEY, String(Math.round(score)));
  } catch {
    // Ignore storage errors
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasWorldRenderer | null>(null);
  const keysHeldRef = useRef<Set<string>>(new Set());

  const initialBest = loadSavedBestScore();
  const stateRef = useRef<GameRunState>(
    createInitialRunState(
      'classic',
      'canary',
      initialBest,
      typeof window !== 'undefined' ? window.innerWidth : 1280,
      typeof window !== 'undefined' ? window.innerHeight : 720
    )
  );

  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isMuted());
  const [hud, setHud] = useState<HudViewState>(() => {
    const s = stateRef.current;
    return {
      phase: s.phase,
      mode: s.mode,
      skin: s.skin,
      score: s.score,
      bestScore: s.bestScore,
      pipesCleared: s.pipesCleared,
      combo: s.combo,
      dashCharges: s.dashCharges,
      maxDashCharges: s.maxDashCharges,
      dashRechargeProgress: s.dashRechargeProgress,
      graceActive: s.graceTimer > 0.1,
      snapshot: s.snapshot,
    };
  });

  const syncHudIfChanged = useCallback((next: GameRunState) => {
    document.body.dataset.state = next.phase;
    setHud((prev) => {
      const graceActive = next.graceTimer > 0.1;
      if (
        prev.phase === next.phase &&
        prev.mode === next.mode &&
        prev.skin === next.skin &&
        prev.score === next.score &&
        prev.bestScore === next.bestScore &&
        prev.pipesCleared === next.pipesCleared &&
        prev.combo === next.combo &&
        prev.dashCharges === next.dashCharges &&
        prev.maxDashCharges === next.maxDashCharges &&
        prev.dashRechargeProgress === next.dashRechargeProgress &&
        prev.graceActive === graceActive &&
        prev.snapshot === next.snapshot
      ) {
        return prev;
      }
      return {
        phase: next.phase,
        mode: next.mode,
        skin: next.skin,
        score: next.score,
        bestScore: next.bestScore,
        pipesCleared: next.pipesCleared,
        combo: next.combo,
        dashCharges: next.dashCharges,
        maxDashCharges: next.maxDashCharges,
        dashRechargeProgress: next.dashRechargeProgress,
        graceActive,
        snapshot: next.snapshot,
      };
    });
  }, []);

  const handleStartOrRestart = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    keysHeldRef.current.clear();

    const next = startNewRun(stateRef.current);
    stateRef.current = next;
    document.body.dataset.state = 'playing';

    const skin = BIRD_SKINS[next.skin];
    rendererRef.current?.spawnBurst(
      next.bird.x,
      next.bird.y,
      6,
      skin.trailColor,
      true,
      0.85
    );
    soundEngine.playFlap();
    syncHudIfChanged(next);
    canvasRef.current?.focus();
  }, [syncHudIfChanged]);

  const handleFlapAction = useCallback(() => {
    const current = stateRef.current;
    if (current.phase !== 'playing' || current.bird.isDead) return;

    const next = triggerFlap(current, false);
    stateRef.current = next;

    const skin = BIRD_SKINS[next.skin];
    rendererRef.current?.spawnBurst(
      next.bird.x - 10,
      next.bird.y + 6,
      5,
      skin.trailColor,
      true,
      0.75
    );
    soundEngine.playFlap();
    syncHudIfChanged(next);
  }, [syncHudIfChanged]);

  const handleDashAction = useCallback(() => {
    const current = stateRef.current;
    if (current.phase !== 'playing' || current.bird.isDead) return;
    if (current.dashCharges <= 0 || current.bird.dashTimer > 0.05) return;

    const next = triggerFeatherDash(current);
    stateRef.current = next;

    rendererRef.current?.spawnBurst(
      next.bird.x,
      next.bird.y,
      14,
      '#38BDF8',
      true,
      1.2
    );
    rendererRef.current?.spawnPopup(
      next.bird.x,
      next.bird.y - 28,
      'SELUNCUR!',
      'Kebal Sesaat',
      '#38BDF8'
    );
    soundEngine.playDash();
    syncHudIfChanged(next);
  }, [syncHudIfChanged]);

  const handleTogglePause = useCallback(() => {
    const current = stateRef.current;
    if (current.phase === 'playing' && !current.bird.isDead) {
      const next: GameRunState = { ...current, phase: 'paused' };
      stateRef.current = next;
      soundEngine.playUiClick();
      syncHudIfChanged(next);
    } else if (current.phase === 'paused') {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      keysHeldRef.current.clear();
      const next: GameRunState = { ...current, phase: 'playing' };
      stateRef.current = next;
      soundEngine.playUiClick();
      syncHudIfChanged(next);
      canvasRef.current?.focus();
    }
  }, [syncHudIfChanged]);

  const handleReturnTitle = useCallback(() => {
    keysHeldRef.current.clear();
    const current = stateRef.current;
    const config = GAME_MODES[current.mode];
    const next: GameRunState = {
      ...current,
      phase: 'title',
      score: 0,
      pipesCleared: 0,
      combo: 0,
      dashCharges: config.maxDashCharges,
      maxDashCharges: config.maxDashCharges,
      dashRechargeProgress: 0,
      pipes: [],
      bird: createInitialBird(
        current.worldWidth,
        current.worldHeight,
        current.groundHeight
      ),
      snapshot: null,
    };
    stateRef.current = next;
    soundEngine.playUiClick();
    syncHudIfChanged(next);
  }, [syncHudIfChanged]);

  const handleSelectMode = useCallback(
    (mode: GameModeId) => {
      const current = stateRef.current;
      const config = GAME_MODES[mode];
      const next: GameRunState = {
        ...current,
        mode,
        dashCharges: config.maxDashCharges,
        maxDashCharges: config.maxDashCharges,
        currentSpeed: config.baseSpeed,
      };
      stateRef.current = next;
      soundEngine.playUiClick();
      syncHudIfChanged(next);
    },
    [syncHudIfChanged]
  );

  const handleSelectSkin = useCallback(
    (skin: BirdSkinId) => {
      const current = stateRef.current;
      const next: GameRunState = {
        ...current,
        skin,
      };
      stateRef.current = next;
      const skinMeta = BIRD_SKINS[skin];
      rendererRef.current?.spawnBurst(
        current.bird.x,
        current.bird.y,
        10,
        skinMeta.primaryColor,
        true,
        0.9
      );
      soundEngine.playUiClick();
      syncHudIfChanged(next);
    },
    [syncHudIfChanged]
  );

  const handleToggleMute = useCallback(() => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  // Mount Canvas2D loop & ResizeObserver once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new CanvasWorldRenderer();
    rendererRef.current = renderer;

    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = stateRef.current;
      const groundHeight = Math.max(84, Math.round(height * 0.12));
      stateRef.current = {
        ...s,
        worldWidth: width,
        worldHeight: height,
        groundHeight,
        bird:
          s.phase === 'title'
            ? createInitialBird(width, height, groundHeight)
            : {
                ...s.bird,
                x: Math.round(Math.min(width * 0.28, 340)),
                y: Math.min(s.bird.y, height - groundHeight - s.bird.radius),
              },
      };
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(document.body);

    // Check ?autostart=1 query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const started = startNewRun(stateRef.current);
      stateRef.current = started;
      document.body.dataset.state = 'playing';
      syncHudIfChanged(started);
    } else {
      document.body.dataset.state = stateRef.current.phase;
    }

    let rafId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      const prevScore = stateRef.current.score;
      const prevBest = stateRef.current.bestScore;
      const next = stepPhysics(stateRef.current, rawDt);
      stateRef.current = next;

      if (next.bestScore > prevBest) {
        saveBestScore(next.bestScore);
      }

      // Trigger weight-scaled audio & particle juice from simulation events
      if (next.lastEvent === 'score') {
        soundEngine.playScore();
        renderer.spawnPopup(
          next.bird.x,
          next.bird.y - 26,
          '+1',
          '',
          '#FEF08A'
        );
      } else if (next.lastEvent === 'perfect') {
        const gained = Math.max(1, next.score - prevScore);
        soundEngine.playPerfectCombo(next.combo);
        renderer.spawnBurst(
          next.bird.x + 12,
          next.bird.y,
          14,
          '#FBBF24',
          false,
          1.1
        );
        renderer.spawnPopup(
          next.bird.x,
          next.bird.y - 32,
          `SEMPURNA +${gained}`,
          next.combo > 1 ? `Kombo x${next.combo}` : 'Cincin Emas!',
          '#FBBF24'
        );
      } else if (next.lastEvent === 'hit') {
        soundEngine.playCollision();
        const skin = BIRD_SKINS[next.skin];
        renderer.spawnBurst(
          next.bird.x,
          next.bird.y,
          24,
          skin.primaryColor,
          true,
          1.45
        );
        renderer.spawnBurst(
          next.bird.x,
          next.bird.y,
          12,
          '#F8FAFC',
          false,
          1.2
        );
      }

      renderer.updateVisualEffects(next, Math.min(rawDt, 0.05));
      renderer.render(ctx, next);
      syncHudIfChanged(next);

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [syncHudIfChanged]);

  // Unified Keyboard & Focus-Loss Hygiene
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;

      if (
        code === 'Space' ||
        code === 'ArrowUp' ||
        code === 'KeyW' ||
        code === 'Enter'
      ) {
        e.preventDefault();
      }

      // Edge-trigger check so holding key never auto-bunny-hops
      if (keysHeldRef.current.has(code)) return;
      keysHeldRef.current.add(code);

      const phase = stateRef.current.phase;

      if (phase === 'title' || phase === 'gameover') {
        if (code === 'Space' || code === 'Enter') {
          handleStartOrRestart();
        }
        return;
      }

      if (code === 'KeyP' || code === 'Escape') {
        handleTogglePause();
        return;
      }

      if (code === 'KeyR') {
        handleStartOrRestart();
        return;
      }

      if (code === 'KeyM') {
        handleToggleMute();
        return;
      }

      if (phase === 'playing') {
        if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
          handleFlapAction();
        } else if (
          code === 'ShiftLeft' ||
          code === 'ShiftRight' ||
          code === 'KeyE' ||
          code === 'ArrowRight' ||
          code === 'KeyD'
        ) {
          handleDashAction();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      keysHeldRef.current.delete(code);

      // Variable jump cut if Flap released early while ascending
      if (
        stateRef.current.phase === 'playing' &&
        (code === 'Space' || code === 'ArrowUp' || code === 'KeyW')
      ) {
        stateRef.current = triggerFlap(stateRef.current, true);
      }
    };

    const clearHeldInputs = () => {
      keysHeldRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeldInputs);
    document.addEventListener('visibilitychange', clearHeldInputs);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeldInputs);
      document.removeEventListener('visibilitychange', clearHeldInputs);
    };
  }, [
    handleDashAction,
    handleFlapAction,
    handleStartOrRestart,
    handleToggleMute,
    handleTogglePause,
  ]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0B132B] select-none">
      {/* Isolated Full-Viewport Game Canvas */}
      <canvas
        ref={canvasRef}
        tabIndex={0}
        data-testid="game-canvas"
        aria-label="Kanvas Permainan Kepak Langit"
        onPointerDown={(e) => {
          if (stateRef.current.phase === 'playing') {
            e.preventDefault();
            handleFlapAction();
          }
        }}
        className="block w-full h-full cursor-pointer outline-none"
      />

      {/* Title Screen Overlay */}
      {hud.phase === 'title' && (
        <TitleScreen
          selectedMode={hud.mode}
          selectedSkin={hud.skin}
          bestScore={hud.bestScore}
          isMuted={isMuted}
          onSelectMode={handleSelectMode}
          onSelectSkin={handleSelectSkin}
          onToggleMute={handleToggleMute}
          onStartGame={handleStartOrRestart}
        />
      )}

      {/* Active Playing HUD */}
      {(hud.phase === 'playing' || hud.phase === 'paused') && (
        <GameHud
          score={hud.score}
          bestScore={hud.bestScore}
          combo={hud.combo}
          dashCharges={hud.dashCharges}
          maxDashCharges={hud.maxDashCharges}
          dashRechargeProgress={hud.dashRechargeProgress}
          mode={hud.mode}
          graceTimer={hud.graceActive ? 1 : 0}
          isMuted={isMuted}
          onTriggerDash={handleDashAction}
          onToggleMute={handleToggleMute}
          onPause={handleTogglePause}
          onRestart={handleStartOrRestart}
        />
      )}

      {/* Pause & Game Over Status Modals */}
      <StatusModals
        phase={hud.phase}
        score={hud.score}
        bestScore={hud.bestScore}
        pipesCleared={hud.pipesCleared}
        snapshot={hud.snapshot}
        onResume={handleTogglePause}
        onRestart={handleStartOrRestart}
        onReturnTitle={handleReturnTitle}
      />
    </main>
  );
}
