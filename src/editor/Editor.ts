import { Level } from '../level/Level';
import { GameObject, ObjectType } from '../level/GameObject';
import { Camera } from '../engine/Camera';
import { InputManager } from '../engine/InputManager';
import { CustomLevelManager } from '../level/CustomLevelManager';

export class Editor {
  public level: Level;
  public camera: Camera;
  public selectedType: ObjectType = ObjectType.BLOCK;
  public currentRotation: number = 0; // 0, 90, 180, 270

  public isTesting: boolean = false;
  public gridSize: number = 30;

  // Режим інструменту: 'place' | 'erase' | 'pan'
  public currentTool: 'place' | 'erase' | 'pan' = 'place';

  // Елементи інтерфейсу висоти камери
  private camYValEl: HTMLElement | null = null;
  private camSliderEl: HTMLInputElement | null = null;

  // Поля назви та автора карти
  private nameInputEl: HTMLInputElement | null = null;
  private creatorInputEl: HTMLInputElement | null = null;

  constructor(level: Level, camera: Camera) {
    this.level = level;
    this.camera = camera;
    this.initUI();
  }

  public initUI(): void {
    this.camYValEl = document.getElementById('editor-camera-y-val');
    this.camSliderEl = document.getElementById('editor-cam-slider') as HTMLInputElement;
    this.nameInputEl = document.getElementById('editor-level-name') as HTMLInputElement;
    this.creatorInputEl = document.getElementById('editor-level-creator') as HTMLInputElement;

    this.syncLevelMeta();

    document.getElementById('btn-cam-up')?.addEventListener('click', () => {
      this.adjustCameraY(60);
    });

    document.getElementById('btn-cam-down')?.addEventListener('click', () => {
      this.adjustCameraY(-60);
    });

    document.getElementById('btn-cam-ground')?.addEventListener('click', () => {
      this.setCameraY(-180);
    });

    this.camSliderEl?.addEventListener('input', () => {
      if (this.camSliderEl) {
        this.setCameraY(parseFloat(this.camSliderEl.value));
      }
    });

    this.updateHeightUI();
  }

  public setLevel(newLevel: Level): void {
    this.level = newLevel;
    this.syncLevelMeta();
  }

  public syncLevelMeta(): void {
    if (this.nameInputEl) {
      this.nameInputEl.value = this.level.name;
    }
    if (this.creatorInputEl) {
      this.creatorInputEl.value = this.level.creator;
    }
  }

  public setCameraY(y: number): void {
    this.camera.y = Math.max(-400, Math.min(3000, y));
    this.updateHeightUI();
  }

  public adjustCameraY(delta: number): void {
    this.setCameraY(this.camera.y + delta);
  }

  public updateHeightUI(): void {
    if (this.camYValEl) {
      const roundedY = Math.round(this.camera.y);
      this.camYValEl.textContent = `${roundedY > 0 ? '+' : ''}${roundedY} px`;
    }
    if (this.camSliderEl) {
      this.camSliderEl.value = Math.round(this.camera.y).toString();
    }
  }

  public setTool(tool: 'place' | 'erase' | 'pan'): void {
    this.currentTool = tool;
  }

  public setSelectedType(type: ObjectType): void {
    this.selectedType = type;
  }

  public rotateCurrent(): void {
    this.currentRotation = (this.currentRotation + 90) % 360;
  }

  public update(input: InputManager): void {
    // Гаряча клавіша 'R' для повороту
    if (input.isKeyJustPressed('KeyR')) {
      this.rotateCurrent();
    }

    // Клавіші стрілок A/D або Left/Right для горизонтального скролінгу
    const panSpeed = 600 * (1 / 60);
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) {
      this.camera.x += panSpeed;
    }
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) {
      this.camera.x = Math.max(0, this.camera.x - panSpeed);
    }

    // Клавіші W/S або Up/Down для регулювання висоти камери (вгору або вниз)
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) {
      this.camera.y = Math.min(3000, this.camera.y + panSpeed);
      this.updateHeightUI();
    }
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) {
      this.camera.y = Math.max(-400, this.camera.y - panSpeed);
      this.updateHeightUI();
    }

    // Плавний скролінг коліщатком миші
    if (Math.abs(input.wheelDeltaY) > 0.01) {
      if (input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight')) {
        // Shift + Wheel = горизонтальний скролінг
        this.camera.x = Math.max(0, this.camera.x + input.wheelDeltaY * 0.8);
      } else {
        // Wheel = плавне регулювання висоти камери (вгору або вниз)
        this.camera.y = Math.max(-400, Math.min(3000, this.camera.y - input.wheelDeltaY * 0.7));
        this.updateHeightUI();
      }
    }
    if (Math.abs(input.wheelDeltaX) > 0.01) {
      this.camera.x = Math.max(0, this.camera.x + input.wheelDeltaX * 0.8);
    }

    const mousePos = input.pointerPosition;
    const worldCoord = this.camera.screenToWorld(mousePos.x, mousePos.y);

    // Прив'язка до сітки 30x30
    const snappedX = Math.floor(worldCoord.x / this.gridSize) * this.gridSize;
    const snappedY = Math.floor(worldCoord.y / this.gridSize) * this.gridSize;

    // Права кнопка миші завжди діє як видалення об'єкта під курсором
    if (input.rightClicked) {
      this.level.removeObjectAt(worldCoord.x, worldCoord.y, 15);
      return;
    }

    // Обробка інструментів при кліку лівою кнопкою
    if (input.isJumpJustPressed()) {
      if (this.currentTool === 'place') {
        if (snappedX >= 0 && snappedY >= 0) {
          // Спочатку прибираємо старий об'єкт на цій клітинці, якщо є
          this.level.removeObjectAt(snappedX + 15, snappedY + 15, 10);

          const newObj = new GameObject({
            type: this.selectedType,
            x: snappedX,
            y: snappedY,
            rotation: this.currentRotation
          });
          this.level.addObject(newObj);
        }
      } else if (this.currentTool === 'erase') {
        this.level.removeObjectAt(worldCoord.x, worldCoord.y, 20);
      }
    }
  }

  /**
   * Рендеринг сітки редактора та напівпрозорого фантому вибраного об'єкта під курсором
   */
  public renderEditorOverlay(
    ctx: CanvasRenderingContext2D,
    input: InputManager
  ): void {
    const w = this.camera.screenWidth;
    const h = this.camera.screenHeight;

    // 1. Рендеринг сітки 30x30
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    const offsetX = this.camera.x % this.gridSize;
    const groundScreen = this.camera.worldToScreen(0, 0);
    const offsetY = (groundScreen.y) % this.gridSize;

    ctx.beginPath();
    for (let x = -offsetX; x <= w; x += this.gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = offsetY; y <= h; y += this.gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    for (let y = offsetY; y >= 0; y -= this.gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 2. Фантомний об'єкт під курсором миші
    const mousePos = input.pointerPosition;
    const worldCoord = this.camera.screenToWorld(mousePos.x, mousePos.y);
    const snappedX = Math.floor(worldCoord.x / this.gridSize) * this.gridSize;
    const snappedY = Math.floor(worldCoord.y / this.gridSize) * this.gridSize;

    if (snappedX >= 0 && snappedY >= 0 && this.currentTool === 'place') {
      const screenPos = this.camera.worldToScreen(snappedX, snappedY);

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.translate(screenPos.x + this.gridSize / 2, screenPos.y - this.gridSize / 2);
      if (this.currentRotation !== 0) {
        ctx.rotate((-this.currentRotation * Math.PI) / 180);
      }

      ctx.fillStyle = '#00ff88';
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.strokeRect(-this.gridSize / 2, -this.gridSize / 2, this.gridSize, this.gridSize);

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Збереження рівня у спільний список карт гравців
   */
  public saveToLocalStorage(): void {
    try {
      if (this.nameInputEl && this.nameInputEl.value.trim()) {
        this.level.name = this.nameInputEl.value.trim();
      }
      if (this.creatorInputEl && this.creatorInputEl.value.trim()) {
        this.level.creator = this.creatorInputEl.value.trim();
      }

      CustomLevelManager.saveLevel(this.level);
      alert(`Карту "${this.level.name}" успішно збережено в розділ "Карти гравців"!`);
    } catch (e) {
      console.error('Save error', e);
      alert('Помилка збереження карти: ' + e);
    }
  }

  /**
   * Завантаження збереженого рівня
   */
  public loadFromLocalStorage(): boolean {
    try {
      const data = localStorage.getItem('geometry_dash_custom_level');
      if (data) {
        this.level = Level.fromJSON(data);
        return true;
      }
    } catch (e) {
      console.error('Load error', e);
    }
    return false;
  }

  public exportJSON(): string {
    return JSON.stringify(this.level.toJSON(), null, 2);
  }

  public importJSON(jsonStr: string): boolean {
    try {
      this.level = Level.fromJSON(jsonStr);
      return true;
    } catch (e) {
      alert('Помилка при зчитуванні JSON рівня: ' + e);
      return false;
    }
  }
}
