import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMedal,
  checkPipeCollision,
  clampDt,
  createInitialRunState,
  startNewRun,
  stepPhysics,
  triggerFeatherDash,
  triggerFlap,
} from './rules';

test('clampDt caps large frame deltas at 0.05s to prevent tunneling', () => {
  assert.equal(clampDt(0.25), 0.05);
  assert.equal(clampDt(0.016), 0.016);
  assert.equal(clampDt(-1), 0);
});

test('startNewRun transitions state from title to playing and sets initial flap impulse', () => {
  const initial = createInitialRunState('classic', 'canary', 10, 1280, 720);
  assert.equal(initial.phase, 'title');

  const running = startNewRun(initial);
  assert.equal(running.phase, 'playing');
  assert.ok(running.bird.vy < 0, 'bird should have upward velocity on start');
  assert.equal(running.score, 0);
  assert.equal(running.bestScore, 10);
});

test('triggerFlap gives upward velocity, pitches bird up, and applies squash-and-stretch', () => {
  let state = startNewRun(createInitialRunState('classic', 'canary', 0));
  state = stepPhysics(state, 0.05);
  const flapped = triggerFlap(state);

  assert.equal(flapped.bird.vy, -420);
  assert.equal(flapped.bird.scaleX, 0.82);
  assert.equal(flapped.bird.scaleY, 1.22);
  assert.equal(flapped.graceTimer, 0);
  assert.equal(flapped.lastEvent, 'flap');
});

test('triggerFeatherDash consumes a charge and grants brief invulnerability', () => {
  const state = startNewRun(createInitialRunState('classic', 'canary', 0));
  const initialCharges = state.dashCharges;
  const dashed = triggerFeatherDash(state);

  assert.equal(dashed.dashCharges, initialCharges - 1);
  assert.ok(dashed.bird.invulnerableTimer > 0.4);
  assert.ok(dashed.bird.dashTimer > 0.3);
  assert.equal(dashed.lastEvent, 'dash');
});

test('passing a pipe and collecting its wind ring increments score and perfectPasses', () => {
  let state = startNewRun(createInitialRunState('classic', 'canary', 0, 1000, 700));
  state.graceTimer = 0;
  state.bird.x = 300;
  state.bird.y = 300;
  state.bird.vy = 0;
  state.pipes = [
    {
      id: 1,
      x: 305,
      width: 74,
      gapY: 300,
      baseGapY: 300,
      gapHeight: 170,
      passed: false,
      behavior: 'static',
      oscPhase: 0,
      oscSpeed: 1.5,
      oscAmplitude: 0,
      hasWindRing: true,
      ringCollected: false,
    },
  ];

  // Step forward enough frames for the pipe to pass the bird at x=300
  for (let i = 0; i < 15; i++) {
    state.bird.y = 300;
    state.bird.vy = 0;
    state = stepPhysics(state, 0.03);
  }

  assert.equal(state.pipesCleared, 1);
  assert.ok(state.score >= 3, `Expected score >= 3 (1 pipe + 2 wind ring), got ${state.score}`);
  assert.equal(state.perfectPasses, 1);
});

test('checkPipeCollision detects collision with top/bottom pipe and respects invulnerability', () => {
  const state = startNewRun(createInitialRunState('classic', 'canary', 0, 1000, 700));
  const playableHeight = state.worldHeight - state.groundHeight;
  const pipe = {
    id: 1,
    x: state.bird.x - 10,
    width: 74,
    gapY: 320,
    baseGapY: 320,
    gapHeight: 150,
    passed: false,
    behavior: 'static' as const,
    oscPhase: 0,
    oscSpeed: 1,
    oscAmplitude: 0,
    hasWindRing: false,
    ringCollected: false,
  };

  // Bird inside gap -> no collision
  state.bird.y = 320;
  assert.equal(checkPipeCollision(state.bird, pipe, playableHeight), false);

  // Bird hitting top pillar -> collision
  state.bird.y = 100;
  assert.equal(checkPipeCollision(state.bird, pipe, playableHeight), true);

  // Bird hitting top pillar while invulnerable -> no collision
  state.bird.invulnerableTimer = 0.4;
  assert.equal(checkPipeCollision(state.bird, pipe, playableHeight), false);
});

test('collision triggers hitstop, defeat delay, and transitions to gameover with snapshot', () => {
  let state = startNewRun(createInitialRunState('classic', 'canary', 5, 1000, 700));
  state.graceTimer = 0;
  state.score = 14;
  state.bird.y = state.worldHeight - state.groundHeight; // Touch ground

  state = stepPhysics(state, 0.016);
  assert.equal(state.bird.isDead, true);
  assert.ok(state.hitstopTimer > 0, 'hitstop should activate on impact');
  assert.equal(state.lastEvent, 'hit');

  // Advance past hitstop and defeat delay
  for (let i = 0; i < 20; i++) {
    state = stepPhysics(state, 0.05);
  }

  assert.equal(state.phase, 'gameover');
  assert.ok(state.snapshot !== null);
  assert.equal(state.snapshot?.score, 14);
  assert.equal(state.snapshot?.bestScore, 14);
  assert.equal(state.snapshot?.isNewRecord, true);
  assert.equal(state.snapshot?.medal, 'silver');
});

test('calculateMedal returns expected medal tiers', () => {
  assert.equal(calculateMedal(2), 'none');
  assert.equal(calculateMedal(5), 'bronze');
  assert.equal(calculateMedal(12), 'silver');
  assert.equal(calculateMedal(25), 'gold');
  assert.equal(calculateMedal(42), 'platinum');
});
