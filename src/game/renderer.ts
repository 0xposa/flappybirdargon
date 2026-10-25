import { BIRD_SKINS } from './rules';
import { BirdEntity, BirdSkin, GameRunState, PipeObstacle } from './types';

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  isFeather: boolean;
  rotation: number;
  vRot: number;
}

interface FloatingPopup {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  text: string;
  subtext: string;
  color: string;
  life: number;
  maxLife: number;
}

interface CloudItem {
  x: number;
  y: number;
  scale: number;
  speedFactor: number;
  layer: number;
}

interface StarItem {
  x: number;
  y: number;
  size: number;
  phase: number;
}

const MAX_PARTICLES = 160;
const MAX_POPUPS = 16;

export class CanvasWorldRenderer {
  private particles: PooledParticle[] = [];
  private particleCursor = 0;
  private popups: FloatingPopup[] = [];
  private popupCursor = 0;
  private clouds: CloudItem[] = [];
  private stars: StarItem[] = [];
  private bgScrollFar = 0;
  private bgScrollMid = 0;
  private groundScroll = 0;

  constructor() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 4,
        alpha: 1,
        life: 0,
        maxLife: 1,
        color: '#FBBF24',
        isFeather: false,
        rotation: 0,
        vRot: 0,
      });
    }

    for (let i = 0; i < MAX_POPUPS; i++) {
      this.popups.push({
        active: false,
        x: 0,
        y: 0,
        vy: -50,
        text: '',
        subtext: '',
        color: '#FBBF24',
        life: 0,
        maxLife: 0.9,
      });
    }

    for (let i = 0; i < 12; i++) {
      this.clouds.push({
        x: (i * 190) % 1800,
        y: 55 + (i % 4) * 65,
        scale: 0.65 + (i % 3) * 0.28,
        speedFactor: 0.14 + (i % 3) * 0.08,
        layer: i % 2,
      });
    }

    for (let i = 0; i < 48; i++) {
      this.stars.push({
        x: (i * 97) % 1600,
        y: (i * 53) % 420,
        size: 1.2 + (i % 3) * 0.8,
        phase: i * 0.7,
      });
    }
  }

  public spawnBurst(
    x: number,
    y: number,
    count: number,
    color: string,
    isFeather = false,
    speedScale = 1
  ): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.particleCursor];
      this.particleCursor = (this.particleCursor + 1) % MAX_PARTICLES;

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = (65 + Math.random() * 165) * speedScale;

      p.active = true;
      p.x = x + (Math.random() - 0.5) * 10;
      p.y = y + (Math.random() - 0.5) * 10;
      p.vx = Math.cos(angle) * speed - 40;
      p.vy = Math.sin(angle) * speed - 30;
      p.size = isFeather ? 6 + Math.random() * 4 : 3 + Math.random() * 4;
      p.alpha = 1;
      p.life = 0;
      p.maxLife = 0.35 + Math.random() * 0.35;
      p.color = color;
      p.isFeather = isFeather;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 10;
    }
  }

  public spawnPopup(
    x: number,
    y: number,
    text: string,
    subtext: string,
    color: string
  ): void {
    const pop = this.popups[this.popupCursor];
    this.popupCursor = (this.popupCursor + 1) % MAX_POPUPS;

    pop.active = true;
    pop.x = x;
    pop.y = y;
    pop.vy = -68;
    pop.text = text;
    pop.subtext = subtext;
    pop.color = color;
    pop.life = 0;
    pop.maxLife = 0.95;
  }

  public updateVisualEffects(state: GameRunState, dt: number): void {
    const scrollSpeed =
      state.phase === 'title'
        ? 95
        : state.phase === 'playing' && !state.bird.isDead
        ? state.currentSpeed
        : 0;

    this.bgScrollFar = (this.bgScrollFar + scrollSpeed * 0.15 * dt) % 1600;
    this.bgScrollMid = (this.bgScrollMid + scrollSpeed * 0.38 * dt) % 1200;
    this.groundScroll = (this.groundScroll + scrollSpeed * dt) % 64;

    // Trail emission during active flight
    if (state.phase === 'playing' && !state.bird.isDead) {
      const skin = BIRD_SKINS[state.skin];
      if (state.bird.dashTimer > 0 || Math.random() < 0.45) {
        const p = this.particles[this.particleCursor];
        this.particleCursor = (this.particleCursor + 1) % MAX_PARTICLES;
        p.active = true;
        p.x = state.bird.x - 14;
        p.y = state.bird.y + (Math.random() - 0.5) * 10;
        p.vx = -scrollSpeed * 0.65;
        p.vy = (Math.random() - 0.5) * 24;
        p.size = state.bird.dashTimer > 0 ? 6 : 3.5;
        p.alpha = 0.85;
        p.life = 0;
        p.maxLife = state.bird.dashTimer > 0 ? 0.32 : 0.22;
        p.color = state.bird.dashTimer > 0 ? '#F8FAFC' : skin.trailColor;
        p.isFeather = false;
        p.rotation = 0;
        p.vRot = 0;
      }
    }

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.isFeather ? 180 : 340) * dt;
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }

    for (let i = 0; i < MAX_POPUPS; i++) {
      const pop = this.popups[i];
      if (!pop.active) continue;
      pop.life += dt;
      if (pop.life >= pop.maxLife) {
        pop.active = false;
        continue;
      }
      pop.y += pop.vy * dt;
      pop.vy *= Math.exp(-3 * dt);
    }

    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.x -= scrollSpeed * c.speedFactor * dt;
      if (c.x < -220) {
        c.x = state.worldWidth + 160;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, state: GameRunState): void {
    const { worldWidth, worldHeight, groundHeight } = state;
    const playableHeight = worldHeight - groundHeight;

    ctx.save();

    // Trauma-based camera shake (decaying trauma * trauma)
    if (state.cameraTrauma > 0.01) {
      const shake = state.cameraTrauma * state.cameraTrauma * 14;
      const ox = (Math.random() * 2 - 1) * shake;
      const oy = (Math.random() * 2 - 1) * shake;
      ctx.translate(ox, oy);
    }

    // 1. Sky Biome Gradient based on score progression
    this.drawSkyAndCelestial(ctx, state, worldWidth, playableHeight);

    // 2. Distant Parallax Mountains & Clouds
    this.drawParallaxMountains(ctx, state, worldWidth, playableHeight);

    // 3. Architectural Stone & Brass Pipes + Wind Rings
    for (let i = 0; i < state.pipes.length; i++) {
      this.drawPipe(ctx, state.pipes[i], playableHeight, state.elapsedTime);
    }

    // 4. Pooled Particles
    this.drawParticles(ctx);

    // 5. Rolling Foreground Ground & Botanical Grass Trim
    this.drawGround(ctx, worldWidth, worldHeight, playableHeight, groundHeight);

    // 6. Grace Hover Guide Ring (when starting run)
    if (state.phase === 'playing' && state.graceTimer > 0.1) {
      this.drawGracePrompt(ctx, state.bird, state.graceTimer);
    }

    // 7. Expressive Avian Hero
    const skin = BIRD_SKINS[state.skin];
    this.drawBird(ctx, state.bird, skin, state.elapsedTime);

    // 8. Floating Score & Combo Popups
    this.drawPopups(ctx);

    ctx.restore();
  }

  private drawSkyAndCelestial(
    ctx: CanvasRenderingContext2D,
    state: GameRunState,
    width: number,
    playableHeight: number
  ): void {
    // Cycle biome every 12 points: 0 = Dawn/Day, 1 = Golden Dusk, 2 = Starlight Night
    const biomeIndex = Math.floor(state.score / 12) % 3;
    const grad = ctx.createLinearGradient(0, 0, 0, playableHeight);

    if (biomeIndex === 0) {
      // Crisp Alpine Morning
      grad.addColorStop(0, '#0F3460');
      grad.addColorStop(0.52, '#2563EB');
      grad.addColorStop(1, '#93C5FD');
    } else if (biomeIndex === 1) {
      // Golden Amber Sunset
      grad.addColorStop(0, '#1E1B4B');
      grad.addColorStop(0.48, '#9D174D');
      grad.addColorStop(0.82, '#EA580C');
      grad.addColorStop(1, '#FDE047');
    } else {
      // Aurora Starlight Night
      grad.addColorStop(0, '#040814');
      grad.addColorStop(0.55, '#0F172A');
      grad.addColorStop(1, '#1E293B');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, playableHeight);

    // Stars visible in Dusk & Night
    if (biomeIndex >= 1) {
      const starAlphaBase = biomeIndex === 2 ? 0.85 : 0.35;
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        const sx = s.x % width;
        const twinkle =
          starAlphaBase * (0.55 + 0.45 * Math.sin(state.elapsedTime * 2.5 + s.phase));
        ctx.fillStyle = `rgba(248, 250, 252, ${twinkle.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sx, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sun / Moon Disk in calm upper-right sky
    const sunX = width * 0.76;
    const sunY = playableHeight * 0.22;
    const sunRadius = Math.min(width, playableHeight) * 0.085;

    const halo = ctx.createRadialGradient(
      sunX,
      sunY,
      sunRadius * 0.2,
      sunX,
      sunY,
      sunRadius * 2.8
    );
    if (biomeIndex === 2) {
      halo.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
      halo.addColorStop(0.35, 'rgba(56, 189, 248, 0.28)');
      halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    } else if (biomeIndex === 1) {
      halo.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      halo.addColorStop(0.4, 'rgba(249, 115, 22, 0.35)');
      halo.addColorStop(1, 'rgba(249, 115, 22, 0)');
    } else {
      halo.addColorStop(0, 'rgba(254, 249, 195, 0.95)');
      halo.addColorStop(0.4, 'rgba(253, 224, 71, 0.28)');
      halo.addColorStop(1, 'rgba(253, 224, 71, 0)');
    }

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = biomeIndex === 2 ? '#F0F9FF' : '#FEF08A';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawParallaxMountains(
    ctx: CanvasRenderingContext2D,
    state: GameRunState,
    width: number,
    playableHeight: number
  ): void {
    const biomeIndex = Math.floor(state.score / 12) % 3;

    // Back clouds
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      if (c.layer === 0) {
        this.drawSingleCloud(ctx, c.x, c.y, c.scale, biomeIndex);
      }
    }

    // Far Mountain Range
    ctx.fillStyle =
      biomeIndex === 0
        ? 'rgba(30, 58, 138, 0.42)'
        : biomeIndex === 1
        ? 'rgba(76, 29, 149, 0.48)'
        : 'rgba(15, 23, 42, 0.72)';

    ctx.beginPath();
    ctx.moveTo(0, playableHeight);
    const stepFar = 220;
    for (let x = -stepFar; x <= width + stepFar * 2; x += stepFar) {
      const worldX = x - (this.bgScrollFar % stepFar);
      const peakIndex = Math.floor((x + this.bgScrollFar) / stepFar);
      const peakHeight = 140 + (( Math.abs(peakIndex * 73) % 5 ) * 28);
      ctx.lineTo(worldX, playableHeight - peakHeight);
      ctx.lineTo(worldX + stepFar * 0.5, playableHeight - peakHeight * 0.58);
    }
    ctx.lineTo(width, playableHeight);
    ctx.closePath();
    ctx.fill();

    // Foreground Clouds
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      if (c.layer === 1) {
        this.drawSingleCloud(ctx, c.x, c.y, c.scale, biomeIndex);
      }
    }

    // Mid-ground Rolling Hills & Silhouette Ridges
    ctx.fillStyle =
      biomeIndex === 0
        ? 'rgba(15, 118, 110, 0.46)'
        : biomeIndex === 1
        ? 'rgba(124, 45, 18, 0.52)'
        : 'rgba(30, 41, 59, 0.85)';

    ctx.beginPath();
    ctx.moveTo(0, playableHeight);
    const stepMid = 160;
    for (let x = -stepMid; x <= width + stepMid * 2; x += stepMid) {
      const worldX = x - (this.bgScrollMid % stepMid);
      const hillIndex = Math.floor((x + this.bgScrollMid) / stepMid);
      const hillH = 65 + (Math.abs(hillIndex * 41) % 4) * 18;
      ctx.quadraticCurveTo(
        worldX + stepMid * 0.5,
        playableHeight - hillH,
        worldX + stepMid,
        playableHeight - 25
      );
    }
    ctx.lineTo(width, playableHeight);
    ctx.closePath();
    ctx.fill();
  }

  private drawSingleCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    biomeIndex: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle =
      biomeIndex === 0
        ? 'rgba(255, 255, 255, 0.34)'
        : biomeIndex === 1
        ? 'rgba(254, 215, 170, 0.26)'
        : 'rgba(148, 163, 184, 0.16)';

    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.arc(28, -8, 40, 0, Math.PI * 2);
    ctx.arc(62, -2, 34, 0, Math.PI * 2);
    ctx.arc(88, 8, 24, 0, Math.PI * 2);
    ctx.arc(-24, 10, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawPipe(
    ctx: CanvasRenderingContext2D,
    pipe: PipeObstacle,
    playableHeight: number,
    elapsedTime: number
  ): void {
    const gapTop = pipe.gapY - pipe.gapHeight * 0.5;
    const gapBottom = pipe.gapY + pipe.gapHeight * 0.5;
    const capHeight = 26;
    const capOverhang = 6;

    // Color scheme based on pipe behavior policy so player reads behavior immediately
    let primaryStart = '#10B981';
    let primaryMid = '#34D399';
    let primaryDark = '#065F46';

    if (pipe.behavior === 'oscillating') {
      // Copper / Amber mechanical moving pillar
      primaryStart = '#D97706';
      primaryMid = '#FBBF24';
      primaryDark = '#78350F';
    } else if (pipe.behavior === 'closing') {
      // Crimson / Obsidian dynamic gate
      primaryStart = '#E11D48';
      primaryMid = '#FB7185';
      primaryDark = '#881337';
    }

    const bodyGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    bodyGrad.addColorStop(0, primaryDark);
    bodyGrad.addColorStop(0.28, primaryMid);
    bodyGrad.addColorStop(0.65, primaryStart);
    bodyGrad.addColorStop(1, '#062C21');

    // Top Pillar Body
    if (gapTop > 0) {
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(pipe.x, 0, pipe.width, Math.max(0, gapTop - capHeight));

      // Outer structural stroke
      ctx.strokeStyle = '#090D16';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, -4, pipe.width, Math.max(0, gapTop - capHeight + 4));

      // Top Pillar Cap
      const capY = Math.max(0, gapTop - capHeight);
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(
        pipe.x - capOverhang,
        capY,
        pipe.width + capOverhang * 2,
        capHeight
      );
      ctx.strokeRect(
        pipe.x - capOverhang,
        capY,
        pipe.width + capOverhang * 2,
        capHeight
      );

      // Specular highlight strip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillRect(pipe.x + 10, 0, 7, Math.max(0, gapTop - capHeight));
      ctx.fillRect(pipe.x - capOverhang + 10, capY + 3, 7, capHeight - 6);
    }

    // Bottom Pillar Body
    const bottomHeight = Math.max(0, playableHeight - gapBottom);
    if (bottomHeight > 0) {
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(
        pipe.x,
        gapBottom + capHeight,
        pipe.width,
        Math.max(0, bottomHeight - capHeight)
      );

      ctx.strokeStyle = '#090D16';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        pipe.x,
        gapBottom + capHeight,
        pipe.width,
        Math.max(0, bottomHeight - capHeight)
      );

      // Bottom Pillar Cap
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(
        pipe.x - capOverhang,
        gapBottom,
        pipe.width + capOverhang * 2,
        capHeight
      );
      ctx.strokeRect(
        pipe.x - capOverhang,
        gapBottom,
        pipe.width + capOverhang * 2,
        capHeight
      );

      // Specular highlight strip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillRect(
        pipe.x + 10,
        gapBottom + capHeight,
        7,
        Math.max(0, bottomHeight - capHeight)
      );
      ctx.fillRect(pipe.x - capOverhang + 10, gapBottom + 3, 7, capHeight - 6);
    }

    // Golden Wind Ring inside the gap for bonus points & Dash charge
    if (pipe.hasWindRing && !pipe.ringCollected) {
      const rx = pipe.x + pipe.width * 0.5;
      const ry = pipe.gapY;
      const pulse = 1 + Math.sin(elapsedTime * 6 + pipe.id) * 0.1;

      ctx.save();
      ctx.translate(rx, ry);
      ctx.scale(pulse, pulse);

      // Outer golden halo
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 22, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Crisp inner ring
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 21, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Center star diamond
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  private drawGround(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    playableHeight: number,
    groundHeight: number
  ): void {
    // Lush Top Grass Strip
    const grassHeight = 20;
    const grassGrad = ctx.createLinearGradient(
      0,
      playableHeight,
      0,
      playableHeight + grassHeight
    );
    grassGrad.addColorStop(0, '#34D399');
    grassGrad.addColorStop(1, '#059669');

    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, playableHeight, width, grassHeight);

    // Scrolling diagonal chevron pattern on grass
    ctx.fillStyle = 'rgba(6, 78, 59, 0.35)';
    const stripeWidth = 32;
    for (let x = -64; x < width + 64; x += stripeWidth) {
      const sx = x - this.groundScroll;
      ctx.beginPath();
      ctx.moveTo(sx, playableHeight);
      ctx.lineTo(sx + 16, playableHeight);
      ctx.lineTo(sx + 4, playableHeight + grassHeight);
      ctx.lineTo(sx - 12, playableHeight + grassHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Deep Earth & Stone Base
    const earthGrad = ctx.createLinearGradient(
      0,
      playableHeight + grassHeight,
      0,
      height
    );
    earthGrad.addColorStop(0, '#78350F');
    earthGrad.addColorStop(0.25, '#451A03');
    earthGrad.addColorStop(1, '#1C1917');

    ctx.fillStyle = earthGrad;
    ctx.fillRect(
      0,
      playableHeight + grassHeight,
      width,
      groundHeight - grassHeight
    );

    // Crisp top horizon border
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, playableHeight);
    ctx.lineTo(width, playableHeight);
    ctx.stroke();
  }

  private drawGracePrompt(
    ctx: CanvasRenderingContext2D,
    bird: BirdEntity,
    graceTimer: number
  ): void {
    ctx.save();
    const alpha = Math.min(0.75, graceTimer * 0.5);
    ctx.strokeStyle = `rgba(251, 191, 36, ${alpha.toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius + 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawBird(
    ctx: CanvasRenderingContext2D,
    bird: BirdEntity,
    skin: BirdSkin,
    elapsedTime: number
  ): void {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    ctx.scale(bird.scaleX, bird.scaleY);

    // Invulnerability / Dash aura shield
    if (bird.invulnerableTimer > 0) {
      ctx.save();
      ctx.fillStyle = skin.glowColor;
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(2, 0, bird.radius + 9, bird.radius + 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const r = bird.radius;
    const isFlashing = bird.hitFlashTimer > 0;

    // Tail feathers
    ctx.fillStyle = isFlashing ? '#FFFFFF' : skin.secondaryColor;
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r + 3, -4);
    ctx.lineTo(-r - 11, -9);
    ctx.lineTo(-r - 8, 0);
    ctx.lineTo(-r - 12, 7);
    ctx.lineTo(-r + 3, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main Avian Body
    ctx.fillStyle = isFlashing ? '#FFFFFF' : skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.12, r * 0.96, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soft Belly Patch
    if (!isFlashing) {
      ctx.fillStyle = skin.bellyColor;
      ctx.beginPath();
      ctx.ellipse(3, r * 0.35, r * 0.72, r * 0.45, -0.1, 0, Math.PI);
      ctx.fill();
    }

    // Crown Crest Feather
    ctx.fillStyle = isFlashing ? '#FFFFFF' : skin.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(-2, -r * 0.88);
    ctx.quadraticCurveTo(-9, -r * 1.45, -14, -r * 1.05);
    ctx.quadraticCurveTo(-8, -r * 0.75, 4, -r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Expressive Eye
    const eyeX = r * 0.42;
    const eyeY = -r * 0.22;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil + Specular Glint
    ctx.fillStyle = '#090D16';
    ctx.beginPath();
    ctx.arc(eyeX + 1.8, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 2.8, eyeY - 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = isFlashing ? '#FFFFFF' : skin.beakColor;
    ctx.beginPath();
    ctx.moveTo(r * 0.88, -5);
    ctx.lineTo(r * 1.55, 1);
    ctx.lineTo(r * 0.85, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Animated Wing
    const wingYOffset = Math.sin(bird.wingPhase + elapsedTime * 2) * 5;
    ctx.fillStyle = isFlashing ? '#FFFFFF' : skin.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(
      -3,
      2 + wingYOffset * 0.45,
      r * 0.58,
      r * 0.42,
      Math.sin(bird.wingPhase) * 0.45 - 0.15,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.isFeather) {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawPopups(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < MAX_POPUPS; i++) {
      const pop = this.popups[i];
      if (!pop.active) continue;

      const progress = pop.life / pop.maxLife;
      const alpha = progress < 0.7 ? 1 : Math.max(0, 1 - (progress - 0.7) / 0.3);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '800 22px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#090D16';
      ctx.lineWidth = 5;
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);

      if (pop.subtext) {
        ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        ctx.lineWidth = 3.5;
        ctx.strokeText(pop.subtext, pop.x, pop.y + 18);
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(pop.subtext, pop.x, pop.y + 18);
      }

      ctx.restore();
    }
  }
}
