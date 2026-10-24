import { Camera } from './engine/Camera';
import { GameLoop } from './engine/GameLoop';
import { InputManager } from './engine/InputManager';
import { AudioManager } from './audio/AudioManager';
import { Player, GameMode, PlayerCheckpoint } from './entities/Player';
import { ParticleSystem } from './entities/ParticleSystem';
import { Level, LevelData } from './level/Level';
import { ObjectType } from './level/GameObject';
import { Collision } from './level/Collision';
import { getAllDefaultLevels } from './level/DefaultLevels';
import { Editor } from './editor/Editor';
import { CustomLevelManager } from './level/CustomLevelManager';

enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PRACTICE = 'PRACTICE',
  EDITOR = 'EDITOR',
  PAUSED = 'PAUSED',
  VICTORY = 'VICTORY'
}

class GeometryDashApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private camera: Camera;
  private input: InputManager;
  private audio: AudioManager;
  private loop: GameLoop;
  private particles: ParticleSystem;

  private player: Player;
  private level: Level;
  private editor: Editor;

  private state: GameState = GameState.MENU;
  private previousState: GameState = GameState.PLAYING;

  // Режим практики (стек чекпоінтів)
  private checkpoints: PlayerCheckpoint[] = [];

  // Статистика
  private attempts: number = 1;
  private deathTimer: number = 0;

  private levels: Level[] = getAllDefaultLevels();
  private currentLevelIndex: number = 0;

  // DOM елементи
  private hudLayer!: HTMLElement;
  private menuLayer!: HTMLElement;
  private editorToolbar!: HTMLElement;
  private editorCameraPanel!: HTMLElement;
  private practiceHud!: HTMLElement;
  private pauseModal!: HTMLElement;
  private victoryModal!: HTMLElement;
  private customizerModal!: HTMLElement;
  private communityModal!: HTMLElement;
  private communityListContainer!: HTMLElement;

  private progressFill!: HTMLElement;
  private progressText!: HTMLElement;
  private attemptsText!: HTMLElement;
  private modeBadge!: HTMLElement;
  private previewCanvas!: HTMLCanvasElement;
  private previewCtx!: CanvasRenderingContext2D;

  // Карусель вибору рівнів
  private levelCardTitle!: HTMLElement;
  private levelCardInfo!: HTMLElement;
  private levelCardBadge!: HTMLElement;
  private levelCardBest!: HTMLElement;
  private levelCardBestFill!: HTMLElement;
  private levelCardElement!: HTMLElement;
  private levelCardCounter!: HTMLElement;
  private levelSelectDropdown!: HTMLSelectElement;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.camera = new Camera(window.innerWidth, window.innerHeight);
    this.input = new InputManager(this.canvas);
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();

    this.player = new Player(0, 0);
    this.levels = getAllDefaultLevels();
    this.level = this.levels[this.currentLevelIndex];
    this.editor = new Editor(this.level, this.camera);

    this.initDOM();
    this.initResize();
    this.initCustomizer();
    this.initEditorUI();
    this.updateLevelCardUI();

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      (interp) => this.render(interp)
    );
    this.loop.start();
  }

  private initDOM(): void {
    this.hudLayer = document.getElementById('game-hud')!;
    this.menuLayer = document.getElementById('menu-screen')!;
    this.editorToolbar = document.getElementById('editor-toolbar')!;
    this.editorCameraPanel = document.getElementById('editor-camera-panel')!;
    this.practiceHud = document.getElementById('practice-hud')!;
    this.pauseModal = document.getElementById('pause-modal')!;
    this.victoryModal = document.getElementById('victory-modal')!;
    this.customizerModal = document.getElementById('customizer-modal')!;
    this.communityModal = document.getElementById('community-modal')!;
    this.communityListContainer = document.getElementById('community-levels-list')!;

    this.progressFill = document.getElementById('hud-progress-fill')!;
    this.progressText = document.getElementById('hud-progress-text')!;
    this.attemptsText = document.getElementById('hud-attempts')!;
    this.modeBadge = document.getElementById('hud-mode-badge')!;

    this.previewCanvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    this.previewCtx = this.previewCanvas.getContext('2d')!;

    // Карусель вибору рівнів
    this.levelCardTitle = document.getElementById('level-card-title')!;
    this.levelCardInfo = document.getElementById('level-card-info')!;
    this.levelCardBadge = document.getElementById('level-card-difficulty-badge')!;
    this.levelCardBest = document.getElementById('level-card-best')!;
    this.levelCardBestFill = document.getElementById('level-card-best-fill')!;
    this.levelCardElement = document.getElementById('level-card')!;
    this.levelCardCounter = document.getElementById('level-card-counter')!;
    this.levelSelectDropdown = document.getElementById('level-select-dropdown') as HTMLSelectElement;

    // Заповнення випадаючого списку 20 рівнів
    this.levels.forEach((lvl, idx) => {
      const opt = document.createElement('option');
      opt.value = idx.toString();
      opt.textContent = `${idx + 1}. ${lvl.name} (${lvl.difficulty} ★${lvl.stars})`;
      this.levelSelectDropdown.appendChild(opt);
    });

    this.levelSelectDropdown.addEventListener('change', () => {
      this.selectLevel(parseInt(this.levelSelectDropdown.value, 10));
    });

    document.getElementById('btn-prev-level')?.addEventListener('click', () => {
      this.currentLevelIndex = (this.currentLevelIndex - 1 + this.levels.length) % this.levels.length;
      this.selectLevel(this.currentLevelIndex);
    });

    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.currentLevelIndex = (this.currentLevelIndex + 1) % this.levels.length;
      this.selectLevel(this.currentLevelIndex);
    });

    // Кнопки меню
    document.getElementById('btn-play-normal')?.addEventListener('click', () => {
      this.startGame(GameState.PLAYING);
    });

    document.getElementById('btn-play-practice')?.addEventListener('click', () => {
      this.startGame(GameState.PRACTICE);
    });

    document.getElementById('btn-open-community')?.addEventListener('click', () => {
      this.openCommunityModal();
    });

    document.getElementById('btn-community-close')?.addEventListener('click', () => {
      this.closeCommunityModal();
    });

    document.getElementById('btn-community-create')?.addEventListener('click', () => {
      this.createNewCustomLevel();
    });

    document.getElementById('btn-community-import')?.addEventListener('click', () => {
      this.importCommunityLevel();
    });

    document.getElementById('btn-open-editor')?.addEventListener('click', () => {
      this.startEditor();
    });

    document.getElementById('btn-open-customizer')?.addEventListener('click', () => {
      this.openCustomizer();
    });

    // Музика
    const musicBtn = document.getElementById('btn-music-toggle');
    musicBtn?.addEventListener('click', () => {
      this.audio.sfx.isMuted = !this.audio.sfx.isMuted;
      if (musicBtn) {
        musicBtn.textContent = this.audio.sfx.isMuted ? '🔇 Музика: ВИМК' : '🔊 Музика: УВІМК';
      }
    });

    const customAudioInput = document.getElementById('custom-audio-input') as HTMLInputElement;
    customAudioInput?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const name = await this.audio.loadCustomAudioFile(file);
          alert(`Аудіотрек "${name}" завантажено!`);
        } catch (err) {
          alert('Помилка завантаження аудіо: ' + err);
        }
      }
    });

    // Кнопки в грі
    document.getElementById('btn-pause')?.addEventListener('click', () => {
      this.pauseGame();
    });

    document.getElementById('btn-add-checkpoint')?.addEventListener('click', () => {
      this.addCheckpoint();
    });

    document.getElementById('btn-remove-checkpoint')?.addEventListener('click', () => {
      this.removeCheckpoint();
    });

    // Модальне вікно паузи
    document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
      this.resumeGame();
    });

    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      this.restartGame();
    });

    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      this.returnToMenu();
    });

    // Модальне вікно перемоги
    document.getElementById('btn-victory-restart')?.addEventListener('click', () => {
      this.restartGame();
    });

    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      this.returnToMenu();
    });
  }

  private initResize(): void {
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.canvas.width = width;
      this.canvas.height = height;
      this.camera.resize(width, height);
    };
    window.addEventListener('resize', resize);
    resize();
  }

  private selectLevel(index: number): void {
    this.currentLevelIndex = index;
    this.level = this.levels[this.currentLevelIndex];
    this.editor = new Editor(this.level, this.camera);
    this.audio.setBPM(this.level.bpm);
    this.updateLevelCardUI();
  }

  private updateLevelCardUI(): void {
    const lvl = this.level;
    this.levelCardTitle.textContent = lvl.name;

    const badgeMap: Record<string, { emoji: string; color: string }> = {
      'Easy': { emoji: '🔵', color: '#00ffff' },
      'Normal': { emoji: '🟢', color: '#00ff88' },
      'Hard': { emoji: '🟠', color: '#ff9900' },
      'Harder': { emoji: '🔴', color: '#ff3300' },
      'Insane': { emoji: '🟣', color: '#cc00ff' },
      'Demon': { emoji: '😈', color: '#ff0033' }
    };

    const b = badgeMap[lvl.difficulty] || { emoji: '⭐', color: '#ffd700' };
    this.levelCardBadge.textContent = b.emoji;
    this.levelCardTitle.style.color = b.color;
    this.levelCardTitle.style.textShadow = `0 0 10px ${b.color}`;
    this.levelCardElement.style.borderColor = b.color;
    this.levelCardElement.style.boxShadow = `0 0 25px ${b.color}55`;

    this.levelCardInfo.textContent = `${lvl.difficulty} • ★ ${lvl.stars} • ${lvl.bpm} BPM`;
    if (this.levelCardCounter) {
      this.levelCardCounter.textContent = `Рівень ${this.currentLevelIndex + 1} з ${this.levels.length}`;
    }
    if (this.levelSelectDropdown) {
      this.levelSelectDropdown.value = this.currentLevelIndex.toString();
    }

    // Найкращий результат рівня
    const bestKey = 'gd_best_' + lvl.id;
    const bestPercent = parseInt(localStorage.getItem(bestKey) || '0', 10);
    this.levelCardBest.textContent = `${bestPercent}%`;
    this.levelCardBestFill.style.width = `${bestPercent}%`;
  }

  private startGame(mode: GameState.PLAYING | GameState.PRACTICE): void {
    this.state = mode;
    this.menuLayer.style.display = 'none';
    this.editorToolbar.style.display = 'none';
    this.editorCameraPanel.style.display = 'none';
    this.hudLayer.style.display = 'flex';
    this.practiceHud.style.display = mode === GameState.PRACTICE ? 'flex' : 'none';
    this.pauseModal.style.display = 'none';
    this.victoryModal.style.display = 'none';

    this.checkpoints = [];
    this.player.reset(0, 0);
    this.level.resetObjects();
    this.particles.reset();
    this.deathTimer = 0;
    this.updateHUDProgress();

    this.audio.setBPM(this.level.bpm);
    this.audio.startMusic(true);
  }

  private startEditor(): void {
    this.state = GameState.EDITOR;
    this.menuLayer.style.display = 'none';
    this.hudLayer.style.display = 'none';
    this.pauseModal.style.display = 'none';
    this.victoryModal.style.display = 'none';
    this.editorToolbar.style.display = 'flex';
    this.editorCameraPanel.style.display = 'flex';

    this.audio.stopMusic();
    this.camera.x = 0;
    this.camera.y = -180;
    this.editor.updateHeightUI();
  }

  private pauseGame(): void {
    if (this.state === GameState.PLAYING || this.state === GameState.PRACTICE) {
      this.previousState = this.state;
      this.state = GameState.PAUSED;
      this.pauseModal.style.display = 'flex';
      this.audio.stopMusic();
    }
  }

  private resumeGame(): void {
    if (this.state === GameState.PAUSED) {
      this.state = this.previousState;
      this.pauseModal.style.display = 'none';
      this.audio.startMusic(false);
    }
  }

  private restartGame(): void {
    this.pauseModal.style.display = 'none';
    this.victoryModal.style.display = 'none';
    this.attempts++;
    this.attemptsText.textContent = `Спроба ${this.attempts}`;
    this.startGame(this.previousState === GameState.PRACTICE ? GameState.PRACTICE : GameState.PLAYING);
  }

  private returnToMenu(): void {
    this.state = GameState.MENU;
    this.menuLayer.style.display = 'flex';
    this.hudLayer.style.display = 'none';
    this.editorToolbar.style.display = 'none';
    this.editorCameraPanel.style.display = 'none';
    this.pauseModal.style.display = 'none';
    this.victoryModal.style.display = 'none';
    this.customizerModal.style.display = 'none';
    this.communityModal.style.display = 'none';

    this.audio.stopMusic();
    this.player.reset(0, 0);
    this.particles.reset();
    this.updateLevelCardUI();
  }

  // ==========================================
  // РОЗДІЛ КАРТ ВІД ГРАВЦІВ / СПІЛЬНОТИ
  // ==========================================
  private openCommunityModal(): void {
    this.communityModal.style.display = 'flex';
    this.renderCommunityLevelsList();
  }

  private closeCommunityModal(): void {
    this.communityModal.style.display = 'none';
  }

  private renderCommunityLevelsList(): void {
    if (!this.communityListContainer) return;
    this.communityListContainer.innerHTML = '';

    const levels = CustomLevelManager.getCustomLevels();

    if (levels.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 40px 0; font-size: 16px;';
      emptyMsg.textContent = 'Поки немає збережених карт. Натисніть "+ Створити карту", щоб зробити свій перший рівень!';
      this.communityListContainer.appendChild(emptyMsg);
      return;
    }

    levels.forEach(lvlData => {
      const card = document.createElement('div');
      card.className = 'community-card';

      const bestKey = 'gd_best_' + (lvlData.id || lvlData.name);
      const bestScore = localStorage.getItem(bestKey) || '0';

      const diff = lvlData.difficulty || 'Normal';
      const stars = lvlData.stars || 1;
      const bpm = lvlData.bpm || 130;
      const objCount = lvlData.objects ? lvlData.objects.length : 0;

      card.innerHTML = `
        <div>
          <div class="community-card-header">
            <div>
              <div class="community-card-title">${lvlData.name}</div>
              <div class="community-card-author">Автор: <span style="color: #ffd700;">${lvlData.creator || 'Гравець'}</span></div>
            </div>
            <div style="font-size: 12px; font-weight: 900; background: #0f172a; border: 1px solid #38bdf8; border-radius: 6px; padding: 2px 8px; color: #00ffcc;">
              ${diff} ★ ${stars}
            </div>
          </div>
          <div class="community-card-meta">
            <span>Об'єктів: ${objCount}</span> • <span>${bpm} BPM</span> • <span>Рекорд: ${bestScore}%</span>
          </div>
        </div>
        <div class="community-card-actions">
          <button class="gd-btn btn-play-normal clickable" style="font-size: 11px; padding: 5px 10px;">▶ Грати</button>
          <button class="gd-btn gd-btn-blue btn-play-practice clickable" style="font-size: 11px; padding: 5px 10px;">◆ Практика</button>
          <button class="gd-btn gd-btn-yellow btn-edit clickable" style="font-size: 11px; padding: 5px 10px;">✏ Редагувати</button>
          <button class="gd-btn gd-btn-blue btn-export clickable" style="font-size: 11px; padding: 5px 8px;" title="Копіювати код рівня">📋</button>
          <button class="gd-btn gd-btn-pink btn-delete clickable" style="font-size: 11px; padding: 5px 8px;" title="Видалити карту">🗑</button>
        </div>
      `;

      card.querySelector('.btn-play-normal')?.addEventListener('click', () => {
        this.closeCommunityModal();
        this.playCustomLevel(lvlData, GameState.PLAYING);
      });

      card.querySelector('.btn-play-practice')?.addEventListener('click', () => {
        this.closeCommunityModal();
        this.playCustomLevel(lvlData, GameState.PRACTICE);
      });

      card.querySelector('.btn-edit')?.addEventListener('click', () => {
        this.closeCommunityModal();
        this.editCustomLevel(lvlData);
      });

      card.querySelector('.btn-export')?.addEventListener('click', () => {
        const json = JSON.stringify(lvlData, null, 2);
        navigator.clipboard.writeText(json).then(() => {
          alert(`Код карти "${lvlData.name}" скопійовано в буфер обміну!`);
        }).catch(() => {
          prompt(`Код карти "${lvlData.name}":`, json);
        });
      });

      card.querySelector('.btn-delete')?.addEventListener('click', () => {
        if (confirm(`Ви дійсно бажаєте видалити карту "${lvlData.name}"?`)) {
          if (lvlData.id) {
            CustomLevelManager.deleteLevel(lvlData.id);
            this.renderCommunityLevelsList();
          }
        }
      });

      this.communityListContainer.appendChild(card);
    });
  }

  private playCustomLevel(lvlData: LevelData, mode: GameState.PLAYING | GameState.PRACTICE): void {
    this.level = new Level(lvlData);
    this.editor.setLevel(this.level);
    this.startGame(mode);
  }

  private editCustomLevel(lvlData: LevelData): void {
    this.level = new Level(lvlData);
    this.editor.setLevel(this.level);
    this.startEditor();
  }

  private createNewCustomLevel(): void {
    const levelName = prompt('Введіть назву нової карти:', 'Моя Карта ' + (CustomLevelManager.getCustomLevels().length + 1));
    if (!levelName) return;

    const creatorName = prompt('Введіть ім\'я автора:', 'Гравець') || 'Гравець';

    const newLevelData: LevelData = {
      id: 'custom_' + Date.now().toString(36),
      name: levelName.trim(),
      creator: creatorName.trim(),
      difficulty: 'Normal',
      stars: 2,
      bpm: 130,
      length: 6000,
      bgColor: '#0a0f1d',
      groundColor: '#001a2b',
      objects: []
    };

    const newLvl = new Level(newLevelData);
    CustomLevelManager.saveLevel(newLvl);
    this.closeCommunityModal();
    this.editCustomLevel(newLevelData);
  }

  private importCommunityLevel(): void {
    const jsonStr = prompt('Вставте JSON-код карти для імпорту:');
    if (!jsonStr) return;

    try {
      const imported = CustomLevelManager.importLevelFromJSON(jsonStr);
      alert(`Карту "${imported.name}" від ${imported.creator} успішно імпортовано!`);
      this.renderCommunityLevelsList();
    } catch (e) {
      alert('Помилка імпорту карти: ' + e);
    }
  }

  private addCheckpoint(): void {
    if (this.state !== GameState.PRACTICE || this.player.isDead) return;
    const cp = this.player.captureState();
    this.checkpoints.push(cp);
    this.audio.sfx.playCheckpointPlaced();
  }

  private removeCheckpoint(): void {
    if (this.state !== GameState.PRACTICE) return;
    if (this.checkpoints.length > 0) {
      this.checkpoints.pop();
      this.audio.sfx.playCheckpointRemoved();
    }
  }

  // Параметри для 3D прев'ю
  private previewRotX: number = 0.35;
  private previewRotY: number = -0.45;
  private isDraggingPreview: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private isCustomizerOpen: boolean = false;

  private openCustomizer(): void {
    this.customizerModal.style.display = 'flex';
    this.isCustomizerOpen = true;
    this.startCustomizer3DLoop();

    document.getElementById('btn-customizer-close')?.addEventListener('click', () => {
      this.customizerModal.style.display = 'none';
      this.isCustomizerOpen = false;
    }, { once: true });
  }

  private startCustomizer3DLoop(): void {
    const loop = () => {
      if (!this.isCustomizerOpen) return;
      if (!this.isDraggingPreview) {
        this.previewRotY += 0.02; // плавне авто-обертання у 3D
      }
      this.renderCustomizerPreview();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private initCustomizer(): void {
    // 1. Відновлення збереженого скіна з LocalStorage
    const savedSkin = localStorage.getItem('geometry_dash_custom_skin');
    if (savedSkin) {
      const img = new Image();
      img.src = savedSkin;
      img.onload = () => {
        this.player.customSkinImage = img;
        this.renderCustomizerPreview();
      };
    }

    // 2. Drag & Drop обертання 3D прев'ю мишкою
    const pCanvas = this.previewCanvas;
    pCanvas.addEventListener('mousedown', (e) => {
      this.isDraggingPreview = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      pCanvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDraggingPreview) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.previewRotY += dx * 0.02;
      this.previewRotX += dy * 0.02;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      if (this.isDraggingPreview) {
        this.isDraggingPreview = false;
        pCanvas.style.cursor = 'grab';
      }
    });

    // 3. Завантаження власного фото через input
    const skinUpload = document.getElementById('skin-image-upload') as HTMLInputElement;
    skinUpload?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            this.player.customSkinImage = img;
            localStorage.setItem('geometry_dash_custom_skin', dataUrl);
            this.renderCustomizerPreview();
            alert('3D фото-скін успішно завантажено та застосовано!');
          };
        };
        reader.readAsDataURL(file);
      }
    });

    // 4. Скидання до стандартного скіна
    document.getElementById('btn-reset-skin-image')?.addEventListener('click', () => {
      this.player.customSkinImage = null;
      localStorage.removeItem('geometry_dash_custom_skin');
      this.renderCustomizerPreview();
    });

    // 5. Перемикач 3D куба
    const check3D = document.getElementById('check-3d-skin') as HTMLInputElement;
    if (check3D) {
      check3D.checked = this.player.use3DSkin;
      check3D.addEventListener('change', () => {
        this.player.use3DSkin = check3D.checked;
        this.renderCustomizerPreview();
      });
    }

    // 6. Генерація швидких пресетів (Cyber Skull, Doge, Galaxy, Mech)
    this.initSkinPresets();

    // 7. Вибір кольорів
    const colors = [
      '#00ff88', '#00e5ff', '#ff0077', '#ffe600',
      '#ff6600', '#aa00ff', '#ffffff', '#ff2222'
    ];

    const pRow = document.getElementById('primary-colors');
    const sRow = document.getElementById('secondary-colors');

    colors.forEach(col => {
      const pBox = document.createElement('div');
      pBox.className = 'color-option' + (col === this.player.primaryColor ? ' selected' : '');
      pBox.style.backgroundColor = col;
      pBox.addEventListener('click', () => {
        this.player.primaryColor = col;
        pRow?.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
        pBox.classList.add('selected');
        this.renderCustomizerPreview();
      });
      pRow?.appendChild(pBox);

      const sBox = document.createElement('div');
      sBox.className = 'color-option' + (col === this.player.secondaryColor ? ' selected' : '');
      sBox.style.backgroundColor = col;
      sBox.addEventListener('click', () => {
        this.player.secondaryColor = col;
        sRow?.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
        sBox.classList.add('selected');
        this.renderCustomizerPreview();
      });
      sRow?.appendChild(sBox);
    });
  }

  private initSkinPresets(): void {
    const container = document.getElementById('skin-presets');
    if (!container) return;

    const presets = [
      { id: 'skull', name: '💀 Cyber Skull', col1: '#ff0055', col2: '#00ffff' },
      { id: 'doge', name: '🐶 Doge Gold', col1: '#e5b800', col2: '#ffffff' },
      { id: 'galaxy', name: '🌌 Nebula 3D', col1: '#6600ff', col2: '#00ffcc' },
      { id: 'mech', name: '🤖 Robo Matrix', col1: '#00ff88', col2: '#112233' }
    ];

    presets.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'gd-btn clickable';
      btn.style.fontSize = '12px';
      btn.style.padding = '6px 10px';
      btn.textContent = p.name;
      btn.addEventListener('click', () => {
        const dataUrl = this.generatePresetDataUrl(p.id, p.col1, p.col2);
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          this.player.customSkinImage = img;
          localStorage.setItem('geometry_dash_custom_skin', dataUrl);
          this.renderCustomizerPreview();
        };
      });
      container.appendChild(btn);
    });
  }

  /**
   * Процедурна генерація красивих фото-текстур для пресетів
   */
  private generatePresetDataUrl(type: string, col1: string, col2: string): string {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d')!;

    // Градієнтний фон
    const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    g.addColorStop(0, col1);
    g.addColorStop(1, '#050a18');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);

    if (type === 'skull') {
      // 3D Череп
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(64, 52, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(48, 68, 32, 28);
      // Очниці
      ctx.fillStyle = '#050a18';
      ctx.beginPath();
      ctx.arc(52, 50, 10, 0, Math.PI * 2);
      ctx.arc(76, 50, 10, 0, Math.PI * 2);
      ctx.fill();
      // Неонове підсвічування очей
      ctx.fillStyle = col2;
      ctx.beginPath();
      ctx.arc(52, 50, 4, 0, Math.PI * 2);
      ctx.arc(76, 50, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'doge') {
      // Додж мордочка
      ctx.fillStyle = '#e8b960';
      ctx.beginPath();
      ctx.ellipse(64, 64, 46, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      // Вушка
      ctx.beginPath();
      ctx.moveTo(30, 36);
      ctx.lineTo(20, 10);
      ctx.lineTo(50, 24);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(98, 36);
      ctx.lineTo(108, 10);
      ctx.lineTo(78, 24);
      ctx.fill();
      // Ніс та очі
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(48, 56, 7, 0, Math.PI * 2);
      ctx.arc(80, 56, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(50, 54, 3, 0, Math.PI * 2);
      ctx.arc(82, 54, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'galaxy') {
      // Космічна галактика з зорями
      ctx.fillStyle = '#090426';
      ctx.fillRect(0, 0, 128, 128);
      const grad = ctx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#ff00aa');
      grad.addColorStop(0.5, '#00ffff');
      grad.addColorStop(1, '#ffaa00');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(64, 64, 36, 0.5, Math.PI * 1.5);
      ctx.stroke();

      // Зірки
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 30; i++) {
        const x = (i * 37) % 128;
        const y = (i * 59) % 128;
        ctx.fillRect(x, y, 2, 2);
      }
    } else {
      // Mech Robot
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(24, 24, 80, 80);
      // Візор
      ctx.fillStyle = '#00ffcc';
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 12;
      ctx.fillRect(36, 48, 56, 16);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 52, 12, 8);
    }

    return c.toDataURL('image/png');
  }

  /**
   * Інтерактивне 3D рендеринг прев'ю кубика
   */
  private renderCustomizerPreview(): void {
    if (!this.previewCtx) return;
    const ctx = this.previewCtx;
    const w = 140;
    const h = 140;
    ctx.clearRect(0, 0, w, h);

    const size = 56;
    const half = size / 2;
    const depth = this.player.use3DSkin ? 24 : 0;

    ctx.save();
    ctx.translate(w / 2, h / 2);

    // 3D проєкція з кутами повороту
    const cosY = Math.cos(this.previewRotY);
    const sinX = Math.sin(this.previewRotX);

    const offX = cosY * depth;
    const offY = -sinX * depth;

    // 1. Задня / бічна 3D грань
    if (this.player.use3DSkin) {
      ctx.fillStyle = '#052216';
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 1.5;

      // Бічна грань
      ctx.beginPath();
      ctx.moveTo(half, -half);
      ctx.lineTo(half + offX, -half + offY);
      ctx.lineTo(half + offX, half + offY);
      ctx.lineTo(half, half);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Верхня грань
      ctx.fillStyle = '#084428';
      ctx.beginPath();
      ctx.moveTo(-half, -half);
      ctx.lineTo(-half + offX, -half + offY);
      ctx.lineTo(half + offX, -half + offY);
      ctx.lineTo(half, -half);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 2. Лицьова грань
    ctx.shadowColor = this.player.primaryColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = this.player.primaryColor;
    ctx.fillRect(-half, -half, size, size);

    // Малювання фото або стандартних очей
    if (this.player.customSkinImage && this.player.customSkinImage.complete) {
      ctx.shadowBlur = 0;
      const pad = 4;
      ctx.save();
      ctx.beginPath();
      ctx.rect(-half + pad, -half + pad, size - pad * 2, size - pad * 2);
      ctx.clip();
      ctx.drawImage(this.player.customSkinImage, -half + pad, -half + pad, size - pad * 2, size - pad * 2);

      // Скляний блік поверхні
      const g = ctx.createLinearGradient(-half, -half, half, half);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      g.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = g;
      ctx.fillRect(-half + pad, -half + pad, size - pad * 2, size - pad * 2);
      ctx.restore();

      ctx.strokeStyle = this.player.secondaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(-half + pad, -half + pad, size - pad * 2, size - pad * 2);
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.player.secondaryColor;
      const pad = 8;
      ctx.fillRect(-half + pad, -half + pad, size - pad * 2, size - pad * 2);

      // Очі
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-half + 12, -half + 12, 10, 10);
      ctx.fillRect(half - 22, -half + 12, 10, 10);
    }

    // Рамка лицьової грані
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-half, -half, size, size);

    ctx.restore();
  }

  private initEditorUI(): void {
    const palette = document.getElementById('editor-palette');
    if (!palette) return;

    const items: { label: string; type: ObjectType }[] = [
      { label: 'Блок', type: ObjectType.BLOCK },
      { label: 'Півблок', type: ObjectType.HALF_BLOCK },
      { label: 'Шип ▲', type: ObjectType.SPIKE },
      { label: 'Півшип', type: ObjectType.HALF_SPIKE },
      { label: 'Сфера Ж', type: ObjectType.ORB_YELLOW },
      { label: 'Сфера Р', type: ObjectType.ORB_PINK },
      { label: 'Сфера Ч', type: ObjectType.ORB_RED },
      { label: 'Сфера С', type: ObjectType.ORB_BLUE },
      { label: 'Батут Ж', type: ObjectType.PAD_YELLOW },
      { label: 'Батут Р', type: ObjectType.PAD_PINK },
      { label: 'Батут С', type: ObjectType.PAD_BLUE },
      { label: 'Портал Куб', type: ObjectType.PORTAL_CUBE },
      { label: 'Портал Ракета', type: ObjectType.PORTAL_SHIP },
      { label: 'Портал Куля', type: ObjectType.PORTAL_BALL },
      { label: 'Портал НЛО', type: ObjectType.PORTAL_UFO },
      { label: 'Портал Хвиля', type: ObjectType.PORTAL_WAVE },
      { label: 'Гравіт. ▲', type: ObjectType.PORTAL_GRAVITY_UP },
      { label: 'Гравіт. ▼', type: ObjectType.PORTAL_GRAVITY_DOWN },
      { label: 'Швидк. 2x', type: ObjectType.PORTAL_SPEED_FAST },
      { label: 'Монета ★', type: ObjectType.COIN },
      { label: 'Фініш 🏁', type: ObjectType.END_TRIGGER }
    ];

    items.forEach((item, index) => {
      const btn = document.createElement('div');
      btn.className = 'palette-item' + (index === 0 ? ' active' : '');
      btn.textContent = item.label;
      btn.addEventListener('click', () => {
        palette.querySelectorAll('.palette-item').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        this.editor.setSelectedType(item.type);
      });
      palette.appendChild(btn);
    });

    document.getElementById('btn-editor-tool-place')?.addEventListener('click', () => {
      this.editor.setTool('place');
    });

    document.getElementById('btn-editor-tool-erase')?.addEventListener('click', () => {
      this.editor.setTool('erase');
    });

    document.getElementById('btn-editor-rotate')?.addEventListener('click', () => {
      this.editor.rotateCurrent();
    });

    document.getElementById('btn-editor-test')?.addEventListener('click', () => {
      this.startGame(GameState.PRACTICE);
    });

    document.getElementById('btn-editor-save')?.addEventListener('click', () => {
      this.editor.saveToLocalStorage();
    });

    document.getElementById('btn-editor-export')?.addEventListener('click', () => {
      const json = this.editor.exportJSON();
      navigator.clipboard.writeText(json).then(() => {
        alert('Дані рівня у форматі JSON скопійовано в буфер обміну!');
      }).catch(() => {
        prompt('Скопіюйте JSON рівня:', json);
      });
    });

    document.getElementById('btn-editor-exit')?.addEventListener('click', () => {
      this.returnToMenu();
    });
  }

  // ==========================================
  // ГОЛОВНИЙ ЦИКЛ ОНОВЛЕННЯ (UPDATE)
  // ==========================================
  private update(dt: number): void {
    this.audio.update(dt);
    this.level.update(dt);
    this.particles.update(dt);

    // Гарячі клавіші практики
    if (this.state === GameState.PRACTICE) {
      if (this.input.isKeyJustPressed('KeyZ')) {
        this.addCheckpoint();
      }
      if (this.input.isKeyJustPressed('KeyX')) {
        this.removeCheckpoint();
      }
    }

    // Клавіша паузи / виходу Escape
    if (this.input.isKeyJustPressed('Escape')) {
      if (this.state === GameState.PLAYING || this.state === GameState.PRACTICE) {
        this.pauseGame();
      } else if (this.state === GameState.PAUSED) {
        this.resumeGame();
      } else if (this.state === GameState.EDITOR) {
        this.returnToMenu();
      }
    }

    if (this.state === GameState.EDITOR) {
      this.editor.update(this.input);
    } else if (this.state === GameState.PLAYING || this.state === GameState.PRACTICE) {
      this.updateGameplay(dt);
    } else if (this.state === GameState.MENU) {
      // Плавний дрейф камери у меню для живого фону
      this.camera.x += 120 * dt;
    }

    this.input.update();
  }

  private updateGameplay(dt: number): void {
    if (this.player.isDead) {
      this.deathTimer += dt;
      if (this.deathTimer >= 0.5) {
        this.respawn();
      }
      return;
    }

    const isJumpHeld = this.input.isJumpHeld();
    const isJumpJustPressed = this.input.isJumpJustPressed();

    // 1. Оновлення фізики гравця
    this.player.updatePhysics(dt, isJumpHeld, isJumpJustPressed, this.particles, this.audio.sfx);

    // 2. Перевірка колізій з об'єктами рівня
    this.checkCollisions(isJumpHeld, isJumpJustPressed);

    // 3. Оновлення камери
    const smoothCam = this.player.mode !== GameMode.CUBE;
    this.camera.update(this.player.position.x, this.player.position.y, dt, smoothCam);

    // 4. Оновлення HUD (прогрес %)
    this.updateHUDProgress();
  }

  private checkCollisions(isJumpHeld: boolean, isJumpJustPressed: boolean): void {
    const playerBox = {
      x: this.player.position.x,
      y: this.player.position.y,
      width: this.player.width,
      height: this.player.height
    };

    // Перевірка падіння на підлогу / смерть хвилі
    if (this.player.position.y <= 0) {
      if (this.player.mode === GameMode.WAVE) {
        this.player.die(this.particles, this.audio.sfx, this.camera);
        return;
      }
      if (this.player.gravityDir === 1) {
        this.player.position.y = 0;
        this.player.velocity.y = 0;
        this.player.isGrounded = true;
      }
    }

    // Смерть хвилі (Wave) при торканні стелі коридору (y >= 240)
    if (this.player.mode === GameMode.WAVE) {
      if (this.player.position.y + this.player.height >= 240) {
        this.player.die(this.particles, this.audio.sfx, this.camera);
        return;
      }
    }

    // Загальний захист від вильоту за межі карти в небо (y > 450)
    if (this.player.position.y > 450) {
      this.player.die(this.particles, this.audio.sfx, this.camera);
      return;
    }

    // Перебір об'єктів навколо гравця
    for (const obj of this.level.objects) {
      if (Math.abs(obj.x - this.player.position.x) > 150) {
        continue;
      }

      // --- 1. ШИПИ ---
      if (obj.type === ObjectType.SPIKE || obj.type === ObjectType.HALF_SPIKE) {
        if (Collision.checkSpikeCollision(playerBox, obj)) {
          this.player.die(this.particles, this.audio.sfx, this.camera);
          return;
        }
      }

      // --- 2. БЛОКИ ---
      else if (obj.type === ObjectType.BLOCK || obj.type === ObjectType.HALF_BLOCK) {
        const blockBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };

        if (Collision.checkAABB(playerBox, blockBox)) {
          // Якщо гравець Wave режиму торкається блоку — смерть
          if (this.player.mode === GameMode.WAVE) {
            this.player.die(this.particles, this.audio.sfx, this.camera);
            return;
          }

          // Нормальна гравітація (падає зверху на блок)
          if (this.player.gravityDir === 1) {
            const playerFeet = this.player.position.y;
            const blockTop = obj.y + obj.height;

            // Якщо ноги гравця були вище або біля верхівки блоку і гравець падає
            if (playerFeet >= blockTop - 12 && this.player.velocity.y <= 0) {
              this.player.position.y = blockTop;
              this.player.velocity.y = 0;
              this.player.isGrounded = true;

              if (this.player.mode === GameMode.CUBE) {
                const angleDeg = (this.player.rotation * 180 / Math.PI) % 360;
                const snappedDeg = Math.round(angleDeg / 90) * 90;
                this.player.rotation = (snappedDeg * Math.PI) / 180;
              }
              continue;
            }
          } else {
            // Інвертована гравітація (приземляється на стелю блоку)
            const playerHead = this.player.position.y + this.player.height;
            const blockBottom = obj.y;

            if (playerHead <= blockBottom + 12 && this.player.velocity.y >= 0) {
              this.player.position.y = blockBottom - this.player.height;
              this.player.velocity.y = 0;
              this.player.isGrounded = true;
              continue;
            }
          }

          // Якщо вдарився в бічну або зворотну грань блоку — краш!
          this.player.die(this.particles, this.audio.sfx, this.camera);
          return;
        }
      }

      // --- 3. БАТУТИ (PADS) ---
      else if (
        obj.type === ObjectType.PAD_YELLOW ||
        obj.type === ObjectType.PAD_PINK ||
        obj.type === ObjectType.PAD_RED ||
        obj.type === ObjectType.PAD_BLUE
      ) {
        const padBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
        if (Collision.checkAABB(playerBox, padBox)) {
          this.audio.sfx.playPad();
          this.player.isGrounded = false;

          if (obj.type === ObjectType.PAD_YELLOW) {
            this.player.velocity.y = this.player.jumpForce * 1.35 * this.player.gravityDir;
          } else if (obj.type === ObjectType.PAD_PINK) {
            this.player.velocity.y = this.player.jumpForce * 0.9 * this.player.gravityDir;
          } else if (obj.type === ObjectType.PAD_RED) {
            this.player.velocity.y = this.player.jumpForce * 1.8 * this.player.gravityDir;
          } else if (obj.type === ObjectType.PAD_BLUE) {
            this.player.gravityDir *= -1;
            this.player.velocity.y = 260 * this.player.gravityDir;
            this.audio.sfx.playGravityFlip();
          }
        }
      }

      // --- 4. СФЕРИ (ORBS) ---
      else if (
        obj.type === ObjectType.ORB_YELLOW ||
        obj.type === ObjectType.ORB_PINK ||
        obj.type === ObjectType.ORB_RED ||
        obj.type === ObjectType.ORB_BLUE
      ) {
        const orbCenter = { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
        if (
          Collision.checkCircleBox(orbCenter.x, orbCenter.y, 24, playerBox) &&
          (isJumpJustPressed || (isJumpHeld && this.player.orbCooldown <= 0))
        ) {
          this.audio.sfx.playOrb();
          this.player.orbCooldown = 0.22;
          this.player.isGrounded = false;

          if (obj.type === ObjectType.ORB_YELLOW) {
            this.player.velocity.y = this.player.jumpForce * 1.15 * this.player.gravityDir;
          } else if (obj.type === ObjectType.ORB_PINK) {
            this.player.velocity.y = this.player.jumpForce * 0.85 * this.player.gravityDir;
          } else if (obj.type === ObjectType.ORB_RED) {
            this.player.velocity.y = this.player.jumpForce * 1.65 * this.player.gravityDir;
          } else if (obj.type === ObjectType.ORB_BLUE) {
            this.player.gravityDir *= -1;
            this.player.velocity.y = 280 * this.player.gravityDir;
            this.audio.sfx.playGravityFlip();
          }
        }
      }

      // --- 5. ПОРТАЛИ ---
      else if (
        obj.type.startsWith('PORTAL_') &&
        !obj.activated
      ) {
        const portalBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
        if (Collision.checkAABB(playerBox, portalBox)) {
          obj.activated = true;
          this.audio.sfx.playPortal();

          switch (obj.type) {
            case ObjectType.PORTAL_CUBE:
              this.player.mode = GameMode.CUBE;
              break;
            case ObjectType.PORTAL_SHIP:
              this.player.mode = GameMode.SHIP;
              break;
            case ObjectType.PORTAL_BALL:
              this.player.mode = GameMode.BALL;
              break;
            case ObjectType.PORTAL_UFO:
              this.player.mode = GameMode.UFO;
              break;
            case ObjectType.PORTAL_WAVE:
              this.player.mode = GameMode.WAVE;
              break;
            case ObjectType.PORTAL_GRAVITY_DOWN:
              this.player.gravityDir = 1;
              break;
            case ObjectType.PORTAL_GRAVITY_UP:
              this.player.gravityDir = -1;
              break;
            case ObjectType.PORTAL_SPEED_SLOW:
              this.player.speedMultiplier = 0.75;
              break;
            case ObjectType.PORTAL_SPEED_NORMAL:
              this.player.speedMultiplier = 1.0;
              break;
            case ObjectType.PORTAL_SPEED_FAST:
              this.player.speedMultiplier = 1.35;
              break;
            case ObjectType.PORTAL_SPEED_VERY_FAST:
              this.player.speedMultiplier = 1.65;
              break;
            case ObjectType.PORTAL_SPEED_INSANE:
              this.player.speedMultiplier = 2.0;
              break;
          }
          this.modeBadge.textContent = this.player.mode;
        }
      }

      // --- 6. МОНЕТИ ---
      else if (obj.type === ObjectType.COIN && !obj.activated) {
        const coinCenter = { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
        if (Collision.checkCircleBox(coinCenter.x, coinCenter.y, 18, playerBox)) {
          obj.activated = true;
          this.audio.sfx.playOrb();
          this.particles.emitJumpDust(coinCenter.x, coinCenter.y, '#ffd700');
        }
      }

      // --- 7. ФІНІШ РІВНЯ ---
      else if (obj.type === ObjectType.END_TRIGGER) {
        const endBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
        if (Collision.checkAABB(playerBox, endBox)) {
          this.triggerVictory();
          return;
        }
      }
    }
  }

  private respawn(): void {
    this.deathTimer = 0;
    this.particles.reset();
    this.level.resetObjects();

    if (this.state === GameState.PRACTICE && this.checkpoints.length > 0) {
      // Відновлення з останнього чекпоінта
      const lastCp = this.checkpoints[this.checkpoints.length - 1];
      this.player.restoreState(lastCp);
      this.camera.x = this.player.position.x - this.camera.playerScreenOffsetX;
    } else {
      // Звичайний рестарт з 0
      this.attempts++;
      this.attemptsText.textContent = `Спроба ${this.attempts}`;
      this.player.reset(0, 0);
      this.camera.x = 0;
      this.camera.y = 0;
      this.audio.startMusic(true);
    }
    this.modeBadge.textContent = this.player.mode;
  }

  private triggerVictory(): void {
    this.state = GameState.VICTORY;
    this.victoryModal.style.display = 'flex';
    this.audio.stopMusic();
    this.audio.sfx.playVictory();

    const stats = document.getElementById('victory-stats');
    if (stats) {
      stats.textContent = `Рівень "${this.level.name}" пройдено на 100%! Спроб: ${this.attempts}`;
    }
  }

  private updateHUDProgress(): void {
    const percent = Math.min(100, Math.max(0, Math.floor((this.player.position.x / this.level.length) * 100)));
    this.progressFill.style.width = `${percent}%`;
    this.progressText.textContent = `${percent}%`;

    // Збереження найкращого результату
    if (this.state === GameState.PLAYING) {
      const bestKey = 'gd_best_' + this.level.id;
      const currentBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
      if (percent > currentBest) {
        localStorage.setItem(bestKey, percent.toString());
      }
    }
  }

  // ==========================================
  // ГОЛОВНИЙ ЦИКЛ РЕНДЕРИНГУ (RENDER)
  // ==========================================
  private render(_interpolation: number): void {
    const ctx = this.ctx;
    const pulse = this.audio.beatPulse;

    // 1. Очищення екрана
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Фон та паралакс
    this.level.renderBackground(ctx, this.camera, pulse);

    // 3. Підлога
    this.level.renderGround(ctx, this.camera, pulse);

    // 4. Об'єкти рівня
    this.level.renderObjects(ctx, this.camera, pulse);

    // 5. Чекпоінти режиму практики (зелені діаманти)
    if (this.state === GameState.PRACTICE) {
      this.renderCheckpoints(ctx);
    }

    // 6. Гравець та його шлейфи
    if (this.state === GameState.PLAYING || this.state === GameState.PRACTICE) {
      this.player.render(ctx, this.camera);
    }

    // 7. Система частинок
    this.particles.render(ctx, this.camera);

    // 8. Оверлей сітки та курсора редактора
    if (this.state === GameState.EDITOR) {
      this.editor.renderEditorOverlay(ctx, this.input);
    }
  }

  private renderCheckpoints(ctx: CanvasRenderingContext2D): void {
    for (const cp of this.checkpoints) {
      const screenPos = this.camera.worldToScreen(cp.x + 15, cp.y + 15);
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);

      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
}

// Запуск гри при завантаженні сторінки
window.addEventListener('DOMContentLoaded', () => {
  new GeometryDashApp();
});
