export type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export type GameModeId = 'classic' | 'zen' | 'storm';

export type BirdSkinId = 'canary' | 'phoenix' | 'phantom' | 'emerald';

export type MedalTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type PipeBehavior = 'static' | 'oscillating' | 'closing';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  subtitle: string;
  gravity: number;
  flapImpulse: number;
  baseSpeed: number;
  maxSpeed: number;
  pipeGap: number;
  minPipeGap: number;
  spawnInterval: number;
  maxDashCharges: number;
}

export interface BirdSkin {
  id: BirdSkinId;
  name: string;
  role: string;
  primaryColor: string;
  secondaryColor: string;
  bellyColor: string;
  beakColor: string;
  trailColor: string;
  glowColor: string;
}

export interface BirdEntity {
  x: number;
  y: number;
  vy: number;
  radius: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  wingPhase: number;
  flapBufferTimer: number;
  dashTimer: number;
  invulnerableTimer: number;
  hitFlashTimer: number;
  isDead: boolean;
}

export interface PipeObstacle {
  id: number;
  x: number;
  width: number;
  gapY: number;
  baseGapY: number;
  gapHeight: number;
  passed: boolean;
  behavior: PipeBehavior;
  oscPhase: number;
  oscSpeed: number;
  oscAmplitude: number;
  hasWindRing: boolean;
  ringCollected: boolean;
}

export interface RunStatsSnapshot {
  score: number;
  bestScore: number;
  isNewRecord: boolean;
  pipesCleared: number;
  perfectPasses: number;
  maxCombo: number;
  medal: MedalTier;
  mode: GameModeId;
}

export interface GameRunState {
  phase: GameState;
  mode: GameModeId;
  skin: BirdSkinId;
  worldWidth: number;
  worldHeight: number;
  groundHeight: number;
  elapsedTime: number;
  graceTimer: number;
  hitstopTimer: number;
  defeatDelayTimer: number;
  cameraTrauma: number;
  score: number;
  bestScore: number;
  pipesCleared: number;
  combo: number;
  maxCombo: number;
  perfectPasses: number;
  dashCharges: number;
  maxDashCharges: number;
  dashRechargeProgress: number;
  nextPipeId: number;
  pipeSpawnTimer: number;
  currentSpeed: number;
  bird: BirdEntity;
  pipes: PipeObstacle[];
  lastEvent:
    | 'none'
    | 'flap'
    | 'score'
    | 'perfect'
    | 'dash'
    | 'hit'
    | 'medal_up';
  snapshot: RunStatsSnapshot | null;
}
