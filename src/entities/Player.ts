import { Vector2D } from '../engine/Vector2D';
import { Camera } from '../engine/Camera';
import { ParticleSystem } from './ParticleSystem';
import { SoundEffects } from '../audio/SoundEffects';

export enum GameMode {
  CUBE = 'CUBE',
  SHIP = 'SHIP',
  BALL = 'BALL',
  UFO = 'UFO',
  WAVE = 'WAVE'
}

export interface PlayerCheckpoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  mode: GameMode;
  gravityDir: number;
  speedMultiplier: number;
}

export class Player {
  public position: Vector2D = new Vector2D(0, 0);
  public velocity: Vector2D = new Vector2D(0, 0);
  public width: number = 30;
  public height: number = 30;

  public mode: GameMode = GameMode.CUBE;
  public gravityDir: number = 1; // 1 = звичайна гравітація (вниз), -1 = інвертована (вгору)
  public speedMultiplier: number = 1.0;

  public isGrounded: boolean = true;
  public isDead: boolean = false;
  public rotation: number = 0; // в радіанах

  // Кастомізація
  public primaryColor: string = '#00ff88';
  public secondaryColor: string = '#00aaff';
  public iconIndex: number = 0;
  public customSkinImage: HTMLImageElement | null = null;
  public use3DSkin: boolean = true;

  // Базові фізичні константи
  public baseSpeed: number = 320; // 1x швидкість
  public gravity: number = 2400;
  public jumpForce: number = 630;

  // Прапорці взаємодії з орбами
  public orbCooldown: number = 0;

  constructor(startX: number = 0, startY: number = 0) {
    this.reset(startX, startY);
  }

  public reset(startX: number = 0, startY: number = 0): void {
    this.position.set(startX, startY);
    this.velocity.set(this.baseSpeed * this.speedMultiplier, 0);
    this.mode = GameMode.CUBE;
    this.gravityDir = 1;
    this.speedMultiplier = 1.0;
    this.isGrounded = true;
    this.isDead = false;
    this.rotation = 0;
    this.orbCooldown = 0;
  }

  public captureState(): PlayerCheckpoint {
    return {
      x: this.position.x,
      y: this.position.y,
      vx: this.velocity.x,
      vy: this.velocity.y,
      rotation: this.rotation,
      mode: this.mode,
      gravityDir: this.gravityDir,
      speedMultiplier: this.speedMultiplier
    };
  }

  public restoreState(cp: PlayerCheckpoint): void {
    this.position.set(cp.x, cp.y);
    this.velocity.set(cp.vx, cp.vy);
    this.rotation = cp.rotation;
    this.mode = cp.mode;
    this.gravityDir = cp.gravityDir;
    this.speedMultiplier = cp.speedMultiplier;
    this.isDead = false;
    this.isGrounded = false;
  }

  /**
   * Оновлення фізики гравця за один фіксований підкрок (dt)
   */
  public updatePhysics(
    dt: number,
    isJumpHeld: boolean,
    isJumpJustPressed: boolean,
    particles: ParticleSystem,
    sfx: SoundEffects
  ): void {
    if (this.isDead) return;

    if (this.orbCooldown > 0) {
      this.orbCooldown -= dt;
    }

    // Горизонтальна швидкість
    this.velocity.x = this.baseSpeed * this.speedMultiplier;
    this.position.x += this.velocity.x * dt;

    // Специфічна логіка для кожного з 5 режимів
    switch (this.mode) {
      case GameMode.CUBE:
        this.updateCube(dt, isJumpHeld, isJumpJustPressed, particles, sfx);
        break;
      case GameMode.SHIP:
        this.updateShip(dt, isJumpHeld, particles);
        break;
      case GameMode.BALL:
        this.updateBall(dt, isJumpJustPressed, sfx);
        break;
      case GameMode.UFO:
        this.updateUFO(dt, isJumpJustPressed, sfx);
        break;
      case GameMode.WAVE:
        this.updateWave(dt, isJumpHeld, particles);
        break;
    }

    // Оновлення вертикальної позиції
    this.position.y += this.velocity.y * dt;

    // Базова підлога (y = 0)
    if (this.gravityDir === 1) {
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocity.y = 0;
        this.isGrounded = true;

        if (this.mode === GameMode.CUBE) {
          // Вирівнювання кута до найближчих 90 градусів при приземленні
          const angleDeg = (this.rotation * 180 / Math.PI) % 360;
          const snappedDeg = Math.round(angleDeg / 90) * 90;
          this.rotation = (snappedDeg * Math.PI) / 180;
        }
      }
    } else {
      // Інвертована гравітація — стеля може бути налаштована або вільна
    }
  }

  private updateCube(
    dt: number,
    isJumpHeld: boolean,
    isJumpJustPressed: boolean,
    particles: ParticleSystem,
    sfx: SoundEffects
  ): void {
    // Стрибок при затисканні або натисканні на землі
    if (this.isGrounded && (isJumpHeld || isJumpJustPressed)) {
      this.velocity.y = this.jumpForce * this.gravityDir;
      this.isGrounded = false;
      sfx.playJump();
      particles.emitJumpDust(this.position.x + this.width / 2, this.position.y, this.primaryColor);
    }

    // Гравітація
    this.velocity.y -= this.gravity * this.gravityDir * dt;

    // Обертання кубика у повітрі
    if (!this.isGrounded) {
      const rotSpeed = 8.5 * this.gravityDir;
      this.rotation -= rotSpeed * dt;
    }
  }

  private updateShip(dt: number, isJumpHeld: boolean, particles: ParticleSystem): void {
    const shipThrust = 1900;
    const shipGravity = 1700;
    const maxVerticalSpeed = 480;

    if (isJumpHeld) {
      this.velocity.y += shipThrust * this.gravityDir * dt;
      particles.emitShipThrust(this.position.x, this.position.y + this.height / 2, '#ffaa00');
    } else {
      this.velocity.y -= shipGravity * this.gravityDir * dt;
    }

    // Обмеження вертикальної швидкості
    this.velocity.y = Math.max(-maxVerticalSpeed, Math.min(maxVerticalSpeed, this.velocity.y));

    // Нахил корпусу корабля
    const targetAngle = (this.velocity.y / maxVerticalSpeed) * 0.55 * this.gravityDir;
    this.rotation += (targetAngle - this.rotation) * 12 * dt;
  }

  private updateBall(dt: number, isJumpJustPressed: boolean, sfx: SoundEffects): void {
    // Гравітація
    this.velocity.y -= this.gravity * this.gravityDir * dt;

    // Перемикання гравітації тільки коли куля торкається поверхні
    if (this.isGrounded && isJumpJustPressed) {
      this.gravityDir *= -1;
      this.isGrounded = false;
      this.velocity.y = 120 * this.gravityDir;
      sfx.playGravityFlip();
    }

    // Обертання кулі
    const rollSpeed = (this.velocity.x / (this.width / 2)) * this.gravityDir;
    this.rotation -= rollSpeed * dt;
  }

  private updateUFO(dt: number, isJumpJustPressed: boolean, sfx: SoundEffects): void {
    const ufoFlapForce = 520;
    const ufoGravity = 2100;

    if (isJumpJustPressed) {
      this.velocity.y = ufoFlapForce * this.gravityDir;
      sfx.playJump();
    }

    this.velocity.y -= ufoGravity * this.gravityDir * dt;

    // Невеликий кут нахилу при злеті/падінні
    const targetAngle = Math.max(-0.35, Math.min(0.35, (this.velocity.y / 500) * 0.35));
    this.rotation += (targetAngle - this.rotation) * 10 * dt;
  }

  private updateWave(_dt: number, isJumpHeld: boolean, particles: ParticleSystem): void {
    // Швидкість хвилі спрямована строго під 45 градусів (vy = ±vx)
    const waveSpeed = Math.abs(this.velocity.x);
    if (isJumpHeld) {
      this.velocity.y = waveSpeed * this.gravityDir;
      this.rotation = -Math.PI / 4 * this.gravityDir;
    } else {
      this.velocity.y = -waveSpeed * this.gravityDir;
      this.rotation = Math.PI / 4 * this.gravityDir;
    }

    // Додавання точки до шлейфу хвилі
    particles.addWavePoint(this.position.x + this.width / 2, this.position.y + this.height / 2);
  }

  /**
   * Смерть гравця
   */
  public die(particles: ParticleSystem, sfx: SoundEffects, camera: Camera): void {
    if (this.isDead) return;
    this.isDead = true;
    sfx.playCrash();
    camera.triggerShake(16, 0.35);
    particles.emitExplosion(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.primaryColor,
      this.secondaryColor
    );
  }

  /**
   * Рендеринг персонажа відповідно до обраного режиму та скіна
   */
  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.isDead) return;

    const screenPos = camera.worldToScreen(this.position.x, this.position.y);
    const cx = screenPos.x + this.width / 2;
    const cy = screenPos.y - this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.rotation); // поворот з урахуванням інверсії canvas Y

    if (this.gravityDir === -1) {
      ctx.scale(1, -1);
    }

    const w = this.width;
    const h = this.height;

    switch (this.mode) {
      case GameMode.CUBE:
        this.renderCubeSkin(ctx, w, h);
        break;
      case GameMode.SHIP:
        this.renderShipSkin(ctx, w, h);
        break;
      case GameMode.BALL:
        this.renderBallSkin(ctx, w, h);
        break;
      case GameMode.UFO:
        this.renderUFOSkin(ctx, w, h);
        break;
      case GameMode.WAVE:
        this.renderWaveSkin(ctx, w, h);
        break;
    }

    ctx.restore();
  }

  private renderCubeSkin(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const halfW = w / 2;
    const halfH = h / 2;

    // 1. 3D ОБ'ЄМНИЙ РЕНДЕРИНГ (екструзія граней куба в перспективі)
    if (this.use3DSkin) {
      const depth = 7; // товщина 3D граней

      // Бічна права грань куба
      ctx.fillStyle = '#053322';
      ctx.strokeStyle = '#004422';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(halfW, -halfH);
      ctx.lineTo(halfW + depth, -halfH - depth);
      ctx.lineTo(halfW + depth, halfH - depth);
      ctx.lineTo(halfW, halfH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Верхня грань куба
      ctx.fillStyle = '#00aa66';
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH);
      ctx.lineTo(-halfW + depth, -halfH - depth);
      ctx.lineTo(halfW + depth, -halfH - depth);
      ctx.lineTo(halfW, -halfH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 2. ГОЛОВНА ЛИЦЬОВА ГРАНЬ КУБА
    ctx.shadowColor = this.primaryColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.primaryColor;
    ctx.fillRect(-halfW, -halfH, w, h);

    // Якщо завантажено фото-скіна (3D фото)
    if (this.customSkinImage && this.customSkinImage.complete) {
      ctx.shadowBlur = 0;
      const pad = 3;
      
      // Малювання кастомного фото-скіна
      ctx.save();
      ctx.beginPath();
      ctx.rect(-halfW + pad, -halfH + pad, w - pad * 2, h - pad * 2);
      ctx.clip();
      ctx.drawImage(this.customSkinImage, -halfW + pad, -halfH + pad, w - pad * 2, h - pad * 2);

      // Легкий 3D скляний блік поверх фото
      const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW + pad, -halfH + pad, w - pad * 2, h - pad * 2);

      ctx.restore();

      // Неонова рамка
      ctx.strokeStyle = this.secondaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(-halfW + pad, -halfH + pad, w - pad * 2, h - pad * 2);
    } else {
      // Стандартний скін кубика
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.secondaryColor;
      const innerPad = 5;
      ctx.fillRect(-halfW + innerPad, -halfH + innerPad, w - innerPad * 2, h - innerPad * 2);

      // Очі кубика (класичний GD вигляд)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-halfW + 7, -halfH + 7, 5, 5);
      ctx.fillRect(halfW - 12, -halfH + 7, 5, 5);
    }

    // Зовнішня чорна рамка куба
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfW, -halfH, w, h);
  }

  private renderShipSkin(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Корпус ракети
    ctx.shadowColor = this.primaryColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.primaryColor;
    ctx.beginPath();
    ctx.moveTo(w / 2 + 4, 0);
    ctx.lineTo(-w / 2, -h / 2);
    ctx.lineTo(-w / 4, 0);
    ctx.lineTo(-w / 2, h / 2);
    ctx.closePath();
    ctx.fill();

    // Кабіна корабля
    const cabRadius = 7;
    if (this.customSkinImage && this.customSkinImage.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, cabRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.customSkinImage, -cabRadius, -cabRadius, cabRadius * 2, cabRadius * 2);
      ctx.restore();
      ctx.strokeStyle = this.secondaryColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, cabRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = this.secondaryColor;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private renderBallSkin(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    const r = w / 2;
    ctx.shadowColor = this.primaryColor;
    ctx.shadowBlur = 10;

    // Зовнішнє коло
    ctx.fillStyle = this.primaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    if (this.customSkinImage && this.customSkinImage.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.customSkinImage, -r + 3, -r + 3, (r - 3) * 2, (r - 3) * 2);
      ctx.restore();
    } else {
      // Зубці / сегменти кулі
      ctx.fillStyle = this.secondaryColor;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r - 2, (i * Math.PI) / 2, (i * Math.PI) / 2 + 0.5);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderUFOSkin(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    // Купол
    if (this.customSkinImage && this.customSkinImage.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, -2, 9, Math.PI, 0);
      ctx.clip();
      ctx.drawImage(this.customSkinImage, -9, -11, 18, 18);
      ctx.restore();
    } else {
      ctx.fillStyle = this.secondaryColor;
      ctx.beginPath();
      ctx.arc(0, -2, 9, Math.PI, 0);
      ctx.fill();
    }

    // Літаюча тарілка (еліпс)
    ctx.shadowColor = this.primaryColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 4, w / 2 + 2, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private renderWaveSkin(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    // Гострий трикутник / дротик
    ctx.shadowColor = this.primaryColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.primaryColor;

    ctx.beginPath();
    ctx.moveTo(w / 2 + 6, 0);
    ctx.lineTo(-w / 2, -w / 2);
    ctx.lineTo(-w / 4, 0);
    ctx.lineTo(-w / 2, w / 2);
    ctx.closePath();
    ctx.fill();

    // Серцевина хвилі
    if (this.customSkinImage && this.customSkinImage.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w / 4, 0);
      ctx.lineTo(-w / 4, -w / 4);
      ctx.lineTo(-w / 4, w / 4);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(this.customSkinImage, -w / 4, -w / 4, w / 2, w / 2);
      ctx.restore();
    } else {
      ctx.fillStyle = this.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(w / 4, 0);
      ctx.lineTo(-w / 4, -w / 4);
      ctx.lineTo(-w / 4, w / 4);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
