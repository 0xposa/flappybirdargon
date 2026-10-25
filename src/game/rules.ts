import {
  BirdEntity,
  BirdSkin,
  BirdSkinId,
  GameModeConfig,
  GameModeId,
  GameRunState,
  MedalTier,
  PipeBehavior,
  PipeObstacle,
  RunStatsSnapshot,
} from './types';

export const GAME_MODES: Record<GameModeId, GameModeConfig> = {
  classic: {
    id: 'classic',
    name: 'Ekspedisi Klasik',
    subtitle: 'Ritme arkade presisi · Tantangan bertahap',
    gravity: 1180,
    flapImpulse: -420,
    baseSpeed: 225,
    maxSpeed: 335,
    pipeGap: 170,
    minPipeGap: 138,
    spawnInterval: 1.65,
    maxDashCharges: 2,
  },
  zen: {
    id: 'zen',
    name: 'Angin Santai',
    subtitle: 'Celah lebar · Gravitasi lembut · Cocok pemanasan',
    gravity: 980,
    flapImpulse: -380,
    baseSpeed: 195,
    maxSpeed: 260,
    pipeGap: 200,
    minPipeGap: 172,
    spawnInterval: 1.85,
    maxDashCharges: 3,
  },
  storm: {
    id: 'storm',
    name: 'Badai Puncak',
    subtitle: 'Arus cepat · Pilar bergerak · Skor ganda cincin emas',
    gravity: 1360,
    flapImpulse: -455,
    baseSpeed: 265,
    maxSpeed: 390,
    pipeGap: 156,
    minPipeGap: 130,
    spawnInterval: 1.42,
    maxDashCharges: 3,
  },
};

export const BIRD_SKINS: Record<BirdSkinId, BirdSkin> = {
  canary: {
    id: 'canary',
    name: 'Kenari Surya',
    role: 'Penjelajah Awan Klasik',
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    bellyColor: '#FEF3C7',
    beakColor: '#EF4444',
    trailColor: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.45)',
  },
  phoenix: {
    id: 'phoenix',
    name: 'Elang Bara',
    role: 'Sayap Api Vulkanik',
    primaryColor: '#EF4444',
    secondaryColor: '#991B1B',
    bellyColor: '#FDE68A',
    beakColor: '#F97316',
    trailColor: '#FB923C',
    glowColor: 'rgba(249, 115, 22, 0.5)',
  },
  emerald: {
    id: 'emerald',
    name: 'Kolibri Zamrud',
    role: 'Penjaga Hutan Langit',
    primaryColor: '#10B981',
    secondaryColor: '#047857',
    bellyColor: '#D1FAE5',
    beakColor: '#F59E0B',
    trailColor: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.45)',
  },
  phantom: {
    id: 'phantom',
    name: 'Hantu Kabut',
    role: 'Pengelana Malam Astral',
    primaryColor: '#38BDF8',
    secondaryColor: '#0284C7',
    bellyColor: '#E0F2FE',
    beakColor: '#F43F5E',
    trailColor: '#7DD3FC',
    glowColor: 'rgba(56, 189, 248, 0.5)',
  },
};

export function clampDt(rawDt: number): number {
  if (!Number.isFinite(rawDt) || rawDt < 0) return 0;
  return Math.min(rawDt, 0.05);
}

export function calculateMedal(score: number): MedalTier {
  if (score >= 40) return 'platinum';
  if (score >= 25) return 'gold';
  if (score >= 12) return 'silver';
  if (score >= 5) return 'bronze';
  return 'none';
}

export function createInitialBird(worldWidth: number, worldHeight: number, groundHeight: number): BirdEntity {
  const playableHeight = worldHeight - groundHeight;
  return {
    x: Math.round(Math.min(worldWidth * 0.28, 340)),
    y: Math.round(playableHeight * 0.44),
    vy: 0,
    radius: 20,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    wingPhase: 0,
    flapBufferTimer: 0,
    dashTimer: 0,
    invulnerableTimer: 0,
    hitFlashTimer: 0,
    isDead: false,
  };
}

export function createInitialRunState(
  mode: GameModeId = 'classic',
  skin: BirdSkinId = 'canary',
  bestScore = 0,
  worldWidth = 1280,
  worldHeight = 720
): GameRunState {
  const config = GAME_MODES[mode];
  const groundHeight = Math.max(84, Math.round(worldHeight * 0.12));
  return {
    phase: 'title',
    mode,
    skin,
    worldWidth,
    worldHeight,
    groundHeight,
    elapsedTime: 0,
    graceTimer: 3.8,
    hitstopTimer: 0,
    defeatDelayTimer: 0,
    cameraTrauma: 0,
    score: 0,
    bestScore,
    pipesCleared: 0,
    combo: 0,
    maxCombo: 0,
    perfectPasses: 0,
    dashCharges: config.maxDashCharges,
    maxDashCharges: config.maxDashCharges,
    dashRechargeProgress: 0,
    nextPipeId: 1,
    pipeSpawnTimer: 0.35,
    currentSpeed: config.baseSpeed,
    bird: createInitialBird(worldWidth, worldHeight, groundHeight),
    pipes: [],
    lastEvent: 'none',
    snapshot: null,
  };
}

export function startNewRun(state: GameRunState): GameRunState {
  const config = GAME_MODES[state.mode];
  const bird = createInitialBird(state.worldWidth, state.worldHeight, state.groundHeight);
  bird.vy = config.flapImpulse * 0.6;
  bird.scaleX = 0.86;
  bird.scaleY = 1.16;

  return {
    ...state,
    phase: 'playing',
    elapsedTime: 0,
    graceTimer: 3.8,
    hitstopTimer: 0,
    defeatDelayTimer: 0,
    cameraTrauma: 0,
    score: 0,
    pipesCleared: 0,
    combo: 0,
    maxCombo: 0,
    perfectPasses: 0,
    dashCharges: config.maxDashCharges,
    maxDashCharges: config.maxDashCharges,
    dashRechargeProgress: 0,
    nextPipeId: 1,
    pipeSpawnTimer: 0.25,
    currentSpeed: config.baseSpeed,
    bird,
    pipes: [],
    lastEvent: 'flap',
    snapshot: null,
  };
}

export function triggerFlap(state: GameRunState, cutAscending = false): GameRunState {
  if (state.phase !== 'playing' || state.bird.isDead) {
    return state;
  }

  const config = GAME_MODES[state.mode];
  const bird = { ...state.bird };

  if (cutAscending) {
    if (bird.vy < -120) {
      bird.vy *= 0.55;
    }
    return { ...state, bird };
  }

  bird.vy = config.flapImpulse;
  bird.rotation = -0.46; // Pitch upward (-26 deg)
  bird.scaleX = 0.82;
  bird.scaleY = 1.22;
  bird.wingPhase = 0;
  bird.dashTimer = Math.min(bird.dashTimer, 0.08);

  return {
    ...state,
    graceTimer: 0, // First voluntary flap ends hover grace immediately
    bird,
    lastEvent: 'flap',
  };
}

export function triggerFeatherDash(state: GameRunState): GameRunState {
  if (
    state.phase !== 'playing' ||
    state.bird.isDead ||
    state.dashCharges <= 0 ||
    state.bird.dashTimer > 0.05
  ) {
    return state;
  }

  const bird = {
    ...state.bird,
    vy: 0,
    rotation: 0,
    scaleX: 1.28,
    scaleY: 0.76,
    dashTimer: 0.36,
    invulnerableTimer: 0.52,
  };

  return {
    ...state,
    graceTimer: 0,
    dashCharges: state.dashCharges - 1,
    cameraTrauma: Math.min(1, state.cameraTrauma + 0.22),
    bird,
    lastEvent: 'dash',
  };
}

export function checkPipeCollision(
  bird: BirdEntity,
  pipe: PipeObstacle,
  playableHeight: number
): boolean {
  if (bird.invulnerableTimer > 0) return false;

  // Forgiving hitbox radius (82% of visual radius so near-misses feel fair and thrilling)
  const hitRadius = bird.radius * 0.82;
  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipe.width;

  // Quick horizontal rejection
  if (bird.x + hitRadius < pipeLeft || bird.x - hitRadius > pipeRight) {
    return false;
  }

  const gapTop = pipe.gapY - pipe.gapHeight * 0.5;
  const gapBottom = pipe.gapY + pipe.gapHeight * 0.5;

  // Check if bird circle overlaps top pipe [0, gapTop] or bottom pipe [gapBottom, playableHeight]
  const closestX = Math.max(pipeLeft, Math.min(bird.x, pipeRight));

  // Top pipe check
  const closestTopY = Math.max(0, Math.min(bird.y, gapTop));
  const dxTop = bird.x - closestX;
  const dyTop = bird.y - closestTopY;
  if (dxTop * dxTop + dyTop * dyTop < hitRadius * hitRadius) {
    return true;
  }

  // Bottom pipe check
  const closestBottomY = Math.max(gapBottom, Math.min(bird.y, playableHeight));
  const dxBot = bird.x - closestX;
  const dyBot = bird.y - closestBottomY;
  if (dxBot * dxBot + dyBot * dyBot < hitRadius * hitRadius) {
    return true;
  }

  return false;
}

export function spawnPipeObstacle(
  state: GameRunState,
  randomVal = Math.random(),
  behaviorSeed = Math.random()
): PipeObstacle {
  const config = GAME_MODES[state.mode];
  const playableHeight = state.worldHeight - state.groundHeight;

  // Difficulty progression across pipes cleared
  const progress = Math.min(1, state.pipesCleared / 35);
  const gapHeight = Math.round(
    config.pipeGap - (config.pipeGap - config.minPipeGap) * progress
  );

  const topMargin = 76 + gapHeight * 0.5;
  const bottomMargin = playableHeight - 76 - gapHeight * 0.5;
  const safeSpan = Math.max(40, bottomMargin - topMargin);
  const gapY = Math.round(topMargin + randomVal * safeSpan);

  // Determine pipe archetype (3 distinct policies: static, oscillating, closing)
  let behavior: PipeBehavior = 'static';
  if (state.pipesCleared >= 3 || state.mode === 'storm') {
    if (behaviorSeed > 0.68) {
      behavior = 'oscillating';
    } else if (behaviorSeed > 0.42 && state.pipesCleared >= 7) {
      behavior = 'closing';
    }
  }

  const hasWindRing =
    state.pipesCleared % 2 === 1 || behavior !== 'static' || state.mode === 'storm';

  return {
    id: state.nextPipeId,
    x: state.worldWidth + 60,
    width: 74,
    gapY,
    baseGapY: gapY,
    gapHeight,
    passed: false,
    behavior,
    oscPhase: randomVal * Math.PI * 2,
    oscSpeed: behavior === 'closing' ? 2.4 : 1.75 + progress * 0.9,
    oscAmplitude: behavior === 'oscillating' ? Math.min(54, safeSpan * 0.32) : 22,
    hasWindRing,
    ringCollected: false,
  };
}

export function buildRunSnapshot(state: GameRunState): RunStatsSnapshot {
  const bestScore = Math.max(state.bestScore, state.score);
  return {
    score: state.score,
    bestScore,
    isNewRecord: state.score > state.bestScore && state.score > 0,
    pipesCleared: state.pipesCleared,
    perfectPasses: state.perfectPasses,
    maxCombo: state.maxCombo,
    medal: calculateMedal(state.score),
    mode: state.mode,
  };
}

export function stepPhysics(
  state: GameRunState,
  rawDt: number,
  randomFn: () => number = Math.random
): GameRunState {
  const dt = clampDt(rawDt);
  if (dt === 0 || state.phase === 'paused' || state.phase === 'gameover') {
    return state;
  }

  const playableHeight = state.worldHeight - state.groundHeight;

  // Title screen ambient idle bobbing
  if (state.phase === 'title') {
    const elapsedTime = state.elapsedTime + dt;
    const bird = {
      ...state.bird,
      y: Math.round(playableHeight * 0.44 + Math.sin(elapsedTime * 3.2) * 14),
      rotation: Math.sin(elapsedTime * 3.2) * 0.08,
      wingPhase: (state.bird.wingPhase + dt * 9) % (Math.PI * 2),
      scaleX: 1,
      scaleY: 1,
    };
    return {
      ...state,
      elapsedTime,
      bird,
      lastEvent: 'none',
    };
  }

  // Playing state
  let nextState: GameRunState = {
    ...state,
    lastEvent: 'none',
    cameraTrauma: Math.max(0, state.cameraTrauma - dt * 1.85),
  };

  // Hitstop freeze timer (camera shake and flash tick in real dt while physics wait)
  if (nextState.hitstopTimer > 0) {
    const remainingHitstop = Math.max(0, nextState.hitstopTimer - dt);
    const bird = {
      ...nextState.bird,
      hitFlashTimer: Math.max(0, nextState.bird.hitFlashTimer - dt),
    };
    return {
      ...nextState,
      hitstopTimer: remainingHitstop,
      bird,
    };
  }

  // If bird is dead and falling/waiting for defeat beat before showing Game Over modal
  if (nextState.bird.isDead) {
    const config = GAME_MODES[nextState.mode];
    const bird = { ...nextState.bird };
    bird.vy = Math.min(900, bird.vy + config.gravity * dt);
    bird.y = Math.min(playableHeight - bird.radius, bird.y + bird.vy * dt);
    bird.rotation = Math.min(Math.PI * 0.48, bird.rotation + dt * 6.5);
    bird.hitFlashTimer = Math.max(0, bird.hitFlashTimer - dt);

    const defeatDelayTimer = nextState.defeatDelayTimer - dt;
    if (defeatDelayTimer <= 0) {
      const snapshot = nextState.snapshot ?? buildRunSnapshot(nextState);
      return {
        ...nextState,
        phase: 'gameover',
        bestScore: snapshot.bestScore,
        defeatDelayTimer: 0,
        bird,
        snapshot,
      };
    }

    return {
      ...nextState,
      defeatDelayTimer,
      bird,
    };
  }

  const config = GAME_MODES[nextState.mode];
  const elapsedTime = nextState.elapsedTime + dt;
  const graceTimer = Math.max(0, nextState.graceTimer - dt);

  // Speed scaling based on pipes cleared
  const speedProgress = Math.min(1, nextState.pipesCleared / 40);
  const baseTargetSpeed =
    config.baseSpeed + (config.maxSpeed - config.baseSpeed) * speedProgress;
  const dashMultiplier = nextState.bird.dashTimer > 0 ? 1.85 : 1;
  const currentSpeed = baseTargetSpeed * dashMultiplier;

  // Update Bird Physics
  const bird = { ...nextState.bird };
  bird.dashTimer = Math.max(0, bird.dashTimer - dt);
  bird.invulnerableTimer = Math.max(0, bird.invulnerableTimer - dt);
  bird.hitFlashTimer = Math.max(0, bird.hitFlashTimer - dt);

  // Exponential squash-and-stretch damping back to (1, 1)
  const damp = Math.exp(-14 * dt);
  bird.scaleX = 1 + (bird.scaleX - 1) * damp;
  bird.scaleY = 1 + (bird.scaleY - 1) * damp;

  if (bird.dashTimer > 0) {
    bird.vy = 0;
    bird.rotation = 0;
    bird.wingPhase = (bird.wingPhase + dt * 18) % (Math.PI * 2);
  } else if (graceTimer > 0) {
    // Gentle autopilot hover during opening 2.1s if user hasn't pressed flap yet
    const targetY = playableHeight * 0.44 + Math.sin(elapsedTime * 4) * 10;
    bird.vy = (targetY - bird.y) * 6;
    bird.y += bird.vy * dt;
    bird.rotation = Math.max(-0.25, Math.min(0.25, bird.vy * 0.0012));
    bird.wingPhase = (bird.wingPhase + dt * 10) % (Math.PI * 2);
  } else {
    bird.vy = Math.min(780, bird.vy + config.gravity * dt);
    bird.y += bird.vy * dt;

    // Pitch follows vertical velocity naturally
    if (bird.vy < 0) {
      bird.rotation = -0.45;
      bird.wingPhase = (bird.wingPhase + dt * 15) % (Math.PI * 2);
    } else {
      const fallFactor = Math.min(1, (bird.vy - 60) / 520);
      bird.rotation = -0.45 + Math.max(0, fallFactor) * 1.65;
      bird.wingPhase = (bird.wingPhase + dt * 6) % (Math.PI * 2);
    }
  }

  // Ceiling clamp (never get stuck above screen)
  if (bird.y < bird.radius + 8) {
    bird.y = bird.radius + 8;
    bird.vy = Math.max(0, bird.vy);
  }

  // Spawn & Move Pipes
  let pipeSpawnTimer = nextState.pipeSpawnTimer - dt;
  let nextPipeId = nextState.nextPipeId;
  const pipes = nextState.pipes
    .map((p) => {
      const nextX = p.x - currentSpeed * dt;
      const nextPhase = p.oscPhase + p.oscSpeed * dt;
      let nextGapY = p.baseGapY;
      let nextGapHeight = p.gapHeight;

      if (p.behavior === 'oscillating') {
        nextGapY = p.baseGapY + Math.sin(nextPhase) * p.oscAmplitude;
      } else if (p.behavior === 'closing') {
        nextGapHeight = p.gapHeight + Math.sin(nextPhase) * 14;
      }

      return {
        ...p,
        x: nextX,
        oscPhase: nextPhase,
        gapY: nextGapY,
        gapHeight: nextGapHeight,
      };
    })
    .filter((p) => p.x + p.width > -120);

  if (pipeSpawnTimer <= 0 && graceTimer <= 2.9) {
    const newPipe = spawnPipeObstacle(
      { ...nextState, nextPipeId },
      randomFn(),
      randomFn()
    );
    pipes.push(newPipe);
    nextPipeId += 1;
    const intervalScale = Math.max(0.76, 1 - speedProgress * 0.22);
    pipeSpawnTimer = config.spawnInterval * intervalScale;
  }

  // Check Scoring, Wind Ring Collection & Collisions
  let score = nextState.score;
  let pipesCleared = nextState.pipesCleared;
  let combo = nextState.combo;
  let maxCombo = nextState.maxCombo;
  let perfectPasses = nextState.perfectPasses;
  let dashCharges = nextState.dashCharges;
  let dashRechargeProgress = nextState.dashRechargeProgress;
  let lastEvent = nextState.lastEvent;
  let hitDetected = false;

  for (let i = 0; i < pipes.length; i++) {
    const pipe = pipes[i];

    // Check Wind Ring pickup inside gap
    if (pipe.hasWindRing && !pipe.ringCollected) {
      const ringX = pipe.x + pipe.width * 0.5;
      const ringY = pipe.gapY;
      const dx = bird.x - ringX;
      const dy = bird.y - ringY;
      if (Math.hypot(dx, dy) <= bird.radius + 26) {
        pipe.ringCollected = true;
        score += 2;
        combo += 1;
        maxCombo = Math.max(maxCombo, combo);
        perfectPasses += 1;
        dashRechargeProgress += 1;
        if (dashRechargeProgress >= 2 && dashCharges < nextState.maxDashCharges) {
          dashCharges += 1;
          dashRechargeProgress = 0;
        }
        lastEvent = 'perfect';
      }
    }

    // Check Pipe Pass
    if (!pipe.passed && pipe.x + pipe.width * 0.5 < bird.x) {
      pipe.passed = true;
      pipesCleared += 1;
      score += 1;

      // Check if center pass even without wind ring
      const distFromCenter = Math.abs(bird.y - pipe.gapY);
      if (!pipe.hasWindRing && distFromCenter <= pipe.gapHeight * 0.22) {
        score += 1;
        combo += 1;
        maxCombo = Math.max(maxCombo, combo);
        perfectPasses += 1;
        lastEvent = 'perfect';
      } else if (!pipe.ringCollected && pipe.hasWindRing) {
        combo = 0;
        if (lastEvent === 'none') lastEvent = 'score';
      } else {
        if (lastEvent === 'none') lastEvent = 'score';
      }

      dashRechargeProgress += 0.5;
      if (dashRechargeProgress >= 2 && dashCharges < nextState.maxDashCharges) {
        dashCharges += 1;
        dashRechargeProgress = 0;
      }
    }

    // Check Collision with Pipe
    if (checkPipeCollision(bird, pipe, playableHeight)) {
      hitDetected = true;
      break;
    }
  }

  // Check Ground Collision
  if (!hitDetected && bird.y + bird.radius * 0.85 >= playableHeight) {
    if (bird.invulnerableTimer > 0) {
      // Bounce gently off ground if currently invulnerable from Feather Dash
      bird.y = playableHeight - bird.radius;
      bird.vy = config.flapImpulse * 0.7;
    } else {
      bird.y = playableHeight - bird.radius;
      hitDetected = true;
    }
  }

  if (hitDetected) {
    bird.isDead = true;
    bird.vy = -260;
    bird.scaleX = 1.25;
    bird.scaleY = 0.75;
    bird.hitFlashTimer = 0.14;

    const snapshot = buildRunSnapshot({
      ...nextState,
      score,
      pipesCleared,
      maxCombo,
      perfectPasses,
    });

    return {
      ...nextState,
      elapsedTime,
      graceTimer: 0,
      hitstopTimer: 0.065, // 65ms tactile hitstop freeze
      defeatDelayTimer: 0.48, // 0.48s KO topple beat before Game Over modal
      cameraTrauma: 0.95,
      score,
      bestScore: Math.max(nextState.bestScore, score),
      pipesCleared,
      combo: 0,
      maxCombo,
      perfectPasses,
      dashCharges,
      dashRechargeProgress,
      nextPipeId,
      pipeSpawnTimer,
      currentSpeed: 0,
      bird,
      pipes,
      lastEvent: 'hit',
      snapshot,
    };
  }

  return {
    ...nextState,
    elapsedTime,
    graceTimer,
    score,
    bestScore: nextState.bestScore,
    pipesCleared,
    combo,
    maxCombo,
    perfectPasses,
    dashCharges,
    dashRechargeProgress,
    nextPipeId,
    pipeSpawnTimer,
    currentSpeed,
    bird,
    pipes,
    lastEvent,
  };
}
