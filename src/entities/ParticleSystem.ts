import { Camera } from '../engine/Camera';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  isSquare: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  public wavePoints: { x: number; y: number }[] = [];

  public emitExplosion(x: number, y: number, primaryColor: string, secondaryColor: string): void {
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 450;
      const isPrimary = Math.random() > 0.4;
      const size = 5 + Math.random() * 10;
      const maxLife = 0.5 + Math.random() * 0.7;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: isPrimary ? primaryColor : secondaryColor,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 15,
        life: maxLife,
        maxLife,
        isSquare: true
      });
    }
  }

  public emitShipThrust(x: number, y: number, color: string): void {
    for (let i = 0; i < 2; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 0.5;
      const speed = 120 + Math.random() * 100;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color,
        rotation: 0,
        rotationSpeed: 0,
        life: 0.25,
        maxLife: 0.25,
        isSquare: true
      });
    }
  }

  public emitJumpDust(x: number, y: number, color: string): void {
    for (let i = 0; i < 6; i++) {
      const vx = (Math.random() - 0.5) * 120;
      const vy = Math.random() * 60;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx,
        vy,
        size: 3 + Math.random() * 4,
        color,
        rotation: 0,
        rotationSpeed: 0,
        life: 0.2,
        maxLife: 0.2,
        isSquare: true
      });
    }
  }

  public addWavePoint(x: number, y: number): void {
    this.wavePoints.push({ x, y });
    // Обмежуємо довжину збереженого сліду для оптимізації
    if (this.wavePoints.length > 500) {
      this.wavePoints.shift();
    }
  }

  public clearWave(): void {
    this.wavePoints = [];
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 400 * dt; // легка гравітація на уламки
      p.rotation += p.rotationSpeed * dt;
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    // Рендеринг шлейфу хвилі (Wave zigzag trail)
    if (this.wavePoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      
      const start = camera.worldToScreen(this.wavePoints[0].x, this.wavePoints[0].y);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < this.wavePoints.length; i++) {
        const pt = camera.worldToScreen(this.wavePoints[i].x, this.wavePoints[i].y);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Рендеринг частинок
    ctx.save();
    for (const p of this.particles) {
      const screenPos = camera.worldToScreen(p.x, p.y);
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(p.rotation);

      if (p.isSquare) {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  public reset(): void {
    this.particles = [];
    this.wavePoints = [];
  }
}
