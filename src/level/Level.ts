import { GameObject, GameObjectData, ObjectType } from './GameObject';
import { Camera } from '../engine/Camera';

export interface LevelData {
  id?: string;
  name: string;
  creator?: string;
  difficulty?: 'Easy' | 'Normal' | 'Hard' | 'Harder' | 'Insane' | 'Demon';
  stars?: number;
  bpm?: number;
  length: number;
  bgColor?: string;
  groundColor?: string;
  objects: GameObjectData[];
}

export class Level {
  public id: string;
  public name: string;
  public creator: string;
  public difficulty: string;
  public stars: number;
  public bpm: number;
  public length: number;
  public bgColor: string;
  public groundColor: string;
  public objects: GameObject[] = [];

  // Анімація порталів та сфер
  private animTimer: number = 0;

  constructor(data?: LevelData) {
    this.id = data?.id || Math.random().toString(36).substring(2, 9);
    this.name = data?.name || 'My Level';
    this.creator = data?.creator || 'Player';
    this.difficulty = data?.difficulty || 'Normal';
    this.stars = data?.stars || 1;
    this.bpm = data?.bpm || 130;
    this.length = data?.length || 6000;
    this.bgColor = data?.bgColor || '#0d1117';
    this.groundColor = data?.groundColor || '#001a33';

    if (data?.objects) {
      this.objects = data.objects.map(objData => new GameObject(objData));
    }
  }

  public addObject(obj: GameObject): void {
    this.objects.push(obj);
    if (obj.x + 300 > this.length) {
      this.length = obj.x + 600;
    }
  }

  public removeObjectAt(x: number, y: number, tolerance: number = 20): GameObject | null {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      if (
        x >= obj.x - tolerance &&
        x <= obj.x + obj.width + tolerance &&
        y >= obj.y - tolerance &&
        y <= obj.y + obj.height + tolerance
      ) {
        return this.objects.splice(i, 1)[0];
      }
    }
    return null;
  }

  public resetObjects(): void {
    for (const obj of this.objects) {
      obj.activated = false;
    }
  }

  public toJSON(): LevelData {
    return {
      id: this.id,
      name: this.name,
      creator: this.creator,
      difficulty: this.difficulty as LevelData['difficulty'],
      stars: this.stars,
      bpm: this.bpm,
      length: this.length,
      bgColor: this.bgColor,
      groundColor: this.groundColor,
      objects: this.objects.map(o => o.toJSON())
    };
  }

  public static fromJSON(jsonStr: string): Level {
    const data = JSON.parse(jsonStr) as LevelData;
    return new Level(data);
  }

  public update(dt: number): void {
    this.animTimer += dt;
  }

  /**
   * Рендеринг паралаксного фону з сіткою та пульсацією кольорів під біт
   */
  public renderBackground(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    beatPulse: number
  ): void {
    const w = camera.screenWidth;
    const h = camera.screenHeight;

    // Пульсація яскравості фону під музику
    ctx.save();
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, w, h);

    if (beatPulse > 0.05) {
      ctx.fillStyle = `rgba(255, 255, 255, ${beatPulse * 0.12})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Паралакс-сітка заднього плану
    const parallaxFactor = 0.2;
    const gridSize = 80;
    const offsetX = (camera.x * parallaxFactor) % gridSize;
    const offsetY = (camera.y * parallaxFactor) % gridSize;

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + beatPulse * 0.04})`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = -offsetX; x < w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = h + offsetY; y >= 0; y -= gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Рендеринг лінії підлоги та патерну ґрунту
   */
  public renderGround(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    beatPulse: number
  ): void {
    const groundScreen = camera.worldToScreen(0, 0);
    const groundY = groundScreen.y;
    const w = camera.screenWidth;
    const h = camera.screenHeight;

    ctx.save();

    // Заливка ґрунту під лінією y=0
    ctx.fillStyle = this.groundColor;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Патерн шахівниці/ліній підлоги
    const tileSize = 60;
    const groundOffsetX = camera.x % tileSize;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + beatPulse * 0.08})`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = -groundOffsetX; x < w; x += tileSize) {
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, h);
    }
    for (let y = groundY; y < h; y += tileSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Неонова лінія горизонту, яка пульсує під біт
    const glowAlpha = 0.5 + beatPulse * 0.5;
    ctx.strokeStyle = `rgba(0, 255, 200, ${glowAlpha})`;
    ctx.shadowColor = '#00ffc8';
    ctx.shadowBlur = 8 + beatPulse * 12;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Рендеринг усіх об'єктів рівня в межах видимості камери
   */
  public renderObjects(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    beatPulse: number
  ): void {
    const screenLeft = camera.x - 100;
    const screenRight = camera.x + camera.screenWidth + 100;

    for (const obj of this.objects) {
      // Frustum culling (пропуск об'єктів поза екраном)
      if (obj.x + obj.width < screenLeft || obj.x > screenRight) {
        continue;
      }

      const screenPos = camera.worldToScreen(obj.x, obj.y);

      ctx.save();
      ctx.translate(screenPos.x + obj.width / 2, screenPos.y - obj.height / 2);
      if (obj.rotation !== 0) {
        ctx.rotate((-obj.rotation * Math.PI) / 180);
      }

      this.renderSingleObject(ctx, obj, beatPulse);
      ctx.restore();
    }
  }

  private renderSingleObject(
    ctx: CanvasRenderingContext2D,
    obj: GameObject,
    beatPulse: number
  ): void {
    const w = obj.width;
    const h = obj.height;
    const halfW = w / 2;
    const halfH = h / 2;

    switch (obj.type) {
      case ObjectType.BLOCK:
      case ObjectType.HALF_BLOCK: {
        // Неоновий блок із внутрішньою геометричною рамкою
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-halfW, -halfH, w, h);

        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 4 + beatPulse * 6;
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfW, -halfH, w, h);

        // Внутрішній візерунок блоку
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-halfW + 4, -halfH + 4, w - 8, h - 8);
        break;
      }

      case ObjectType.SPIKE:
      case ObjectType.HALF_SPIKE: {
        // Смертоносний трикутник
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 6 + beatPulse * 8;
        ctx.fillStyle = '#1e0510';
        ctx.beginPath();
        ctx.moveTo(0, -halfH);
        ctx.lineTo(-halfW, halfH);
        ctx.lineTo(halfW, halfH);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Внутрішній контур
        ctx.strokeStyle = 'rgba(255, 80, 120, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -halfH + 6);
        ctx.lineTo(-halfW + 5, halfH - 2);
        ctx.lineTo(halfW - 5, halfH - 2);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case ObjectType.ORB_YELLOW:
      case ObjectType.ORB_PINK:
      case ObjectType.ORB_RED:
      case ObjectType.ORB_BLUE: {
        const orbColors: Record<string, string> = {
          [ObjectType.ORB_YELLOW]: '#ffe600',
          [ObjectType.ORB_PINK]: '#ff00bb',
          [ObjectType.ORB_RED]: '#ff2222',
          [ObjectType.ORB_BLUE]: '#00bbff'
        };
        const col = orbColors[obj.type] || '#ffe600';
        const r = halfW;

        // Зовнішнє пульсуюче кільце
        const pulseR = r + Math.sin(this.animTimer * 8) * 3 + beatPulse * 4;
        ctx.strokeStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Серцевина сфери
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case ObjectType.PAD_YELLOW:
      case ObjectType.PAD_PINK:
      case ObjectType.PAD_RED:
      case ObjectType.PAD_BLUE: {
        const padColors: Record<string, string> = {
          [ObjectType.PAD_YELLOW]: '#ffe600',
          [ObjectType.PAD_PINK]: '#ff00bb',
          [ObjectType.PAD_RED]: '#ff2222',
          [ObjectType.PAD_BLUE]: '#00bbff'
        };
        const col = padColors[obj.type] || '#ffe600';

        ctx.shadowColor = col;
        ctx.shadowBlur = 8;
        ctx.fillStyle = col;
        // Напівкруглий вигляд батута
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW * 0.5, halfH * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case ObjectType.PORTAL_CUBE:
      case ObjectType.PORTAL_SHIP:
      case ObjectType.PORTAL_BALL:
      case ObjectType.PORTAL_UFO:
      case ObjectType.PORTAL_WAVE:
      case ObjectType.PORTAL_GRAVITY_DOWN:
      case ObjectType.PORTAL_GRAVITY_UP:
      case ObjectType.PORTAL_SPEED_SLOW:
      case ObjectType.PORTAL_SPEED_NORMAL:
      case ObjectType.PORTAL_SPEED_FAST:
      case ObjectType.PORTAL_SPEED_VERY_FAST:
      case ObjectType.PORTAL_SPEED_INSANE: {
        const portalColors: Record<string, { border: string; glow: string; text: string }> = {
          [ObjectType.PORTAL_CUBE]: { border: '#00ff88', glow: '#00ff88', text: 'CUBE' },
          [ObjectType.PORTAL_SHIP]: { border: '#ff00aa', glow: '#ff00aa', text: 'SHIP' },
          [ObjectType.PORTAL_BALL]: { border: '#ff8800', glow: '#ff8800', text: 'BALL' },
          [ObjectType.PORTAL_UFO]: { border: '#00ccff', glow: '#00ccff', text: 'UFO' },
          [ObjectType.PORTAL_WAVE]: { border: '#00ffff', glow: '#00ffff', text: 'WAVE' },
          [ObjectType.PORTAL_GRAVITY_DOWN]: { border: '#0066ff', glow: '#0066ff', text: '▼' },
          [ObjectType.PORTAL_GRAVITY_UP]: { border: '#ffff00', glow: '#ffff00', text: '▲' },
          [ObjectType.PORTAL_SPEED_SLOW]: { border: '#ffaa00', glow: '#ffaa00', text: '0.5x' },
          [ObjectType.PORTAL_SPEED_NORMAL]: { border: '#00aaff', glow: '#00aaff', text: '1x' },
          [ObjectType.PORTAL_SPEED_FAST]: { border: '#00ff66', glow: '#00ff66', text: '2x' },
          [ObjectType.PORTAL_SPEED_VERY_FAST]: { border: '#ff00cc', glow: '#ff00cc', text: '3x' },
          [ObjectType.PORTAL_SPEED_INSANE]: { border: '#ff0033', glow: '#ff0033', text: '4x' }
        };

        const config = portalColors[obj.type] || { border: '#ffffff', glow: '#ffffff', text: 'PORTAL' };

        ctx.shadowColor = config.glow;
        ctx.shadowBlur = 12 + beatPulse * 8;
        ctx.strokeStyle = config.border;
        ctx.lineWidth = 3;

        // Овал порталу
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Спіраль/центр всередині порталу
        ctx.fillStyle = `${config.border}33`;
        ctx.fill();

        // Позначка або текст режиму
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.text, 0, 0);
        break;
      }

      case ObjectType.COIN: {
        // Золота зіркова монета
        const r = halfW;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b8860b';
        ctx.beginPath();
        ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
        ctx.fill();

        // Зірочка в центрі монети
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);
        break;
      }

      case ObjectType.END_TRIGGER: {
        // Фінішна стіна
        ctx.strokeStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 4;
        ctx.strokeRect(-halfW, -halfH, w, h);

        ctx.fillStyle = 'rgba(0, 255, 204, 0.2)';
        ctx.fillRect(-halfW, -halfH, w, h);
        break;
      }
    }
  }
}
