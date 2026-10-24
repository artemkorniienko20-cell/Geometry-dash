import { Level, LevelData } from './Level';
import { ObjectType } from './GameObject';

export class CustomLevelManager {
  private static readonly STORAGE_KEY = 'gd_custom_levels_list';

  /**
   * Отримати список усіх карт, створених гравцями / спільнотою
   */
  public static getCustomLevels(): LevelData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as LevelData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading custom levels', e);
    }

    // Якщо список порожній — створюємо початкові карти від авторів спільноти
    const initialLevels = this.getInitialFeaturedLevels();
    this.saveAllLevels(initialLevels);
    return initialLevels;
  }

  /**
   * Зберегти новий або оновити існуючий рівень
   */
  public static saveLevel(level: Level): void {
    const list = this.getCustomLevels();
    const index = list.findIndex(l => l.id === level.id);

    const levelData = level.toJSON();
    if (index >= 0) {
      list[index] = levelData;
    } else {
      list.unshift(levelData);
    }

    this.saveAllLevels(list);
  }

  /**
   * Видалити рівень за ID
   */
  public static deleteLevel(id: string): boolean {
    const list = this.getCustomLevels();
    const filtered = list.filter(l => l.id !== id);
    if (filtered.length !== list.length) {
      this.saveAllLevels(filtered);
      return true;
    }
    return false;
  }

  /**
   * Імпортувати рівень із JSON рядка
   */
  public static importLevelFromJSON(jsonStr: string): LevelData {
    const parsed = JSON.parse(jsonStr) as LevelData;
    if (!parsed.name || !Array.isArray(parsed.objects)) {
      throw new Error('Невалідний формат рівня: відсутня назва або об\'єкти');
    }

    parsed.id = 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    if (!parsed.creator) parsed.creator = 'Гість';
    if (!parsed.length) parsed.length = 6000;

    const list = this.getCustomLevels();
    list.unshift(parsed);
    this.saveAllLevels(list);
    return parsed;
  }

  private static saveAllLevels(levels: LevelData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(levels));
    } catch (e) {
      console.error('Failed to save custom levels', e);
    }
  }

  /**
   * Початкові креативні карти від спільноти
   */
  private static getInitialFeaturedLevels(): LevelData[] {
    return [
      // 1. NEON DREAMS by AlexPro
      {
        id: 'comm_neon_dreams',
        name: 'Neon Dreams',
        creator: 'AlexPro',
        difficulty: 'Normal',
        stars: 2,
        bpm: 132,
        length: 5600,
        bgColor: '#071426',
        groundColor: '#0e2540',
        objects: [
          { type: ObjectType.SPIKE, x: 450, y: 0 },
          { type: ObjectType.PAD_YELLOW, x: 650, y: 0 },
          { type: ObjectType.BLOCK, x: 800, y: 90 },
          { type: ObjectType.BLOCK, x: 830, y: 90 },
          { type: ObjectType.BLOCK, x: 860, y: 90 },
          { type: ObjectType.COIN, x: 830, y: 140 },
          { type: ObjectType.ORB_PINK, x: 1050, y: 50 },
          { type: ObjectType.SPIKE, x: 1200, y: 0 },
          { type: ObjectType.SPIKE, x: 1230, y: 0 },
          { type: ObjectType.PORTAL_BALL, x: 1450, y: 30 },
          { type: ObjectType.BLOCK, x: 1550, y: 150 },
          { type: ObjectType.BLOCK, x: 1580, y: 150 },
          { type: ObjectType.BLOCK, x: 1610, y: 150 },
          { type: ObjectType.BLOCK, x: 1640, y: 150 },
          { type: ObjectType.BLOCK, x: 1670, y: 150 },
          { type: ObjectType.BLOCK, x: 1700, y: 150 },
          { type: ObjectType.SPIKE, x: 1800, y: 0 },
          { type: ObjectType.SPIKE, x: 2000, y: 120, rotation: 180 },
          { type: ObjectType.COIN, x: 2150, y: 80 },
          { type: ObjectType.PORTAL_SHIP, x: 2400, y: 30 },
          { type: ObjectType.BLOCK, x: 2500, y: 0 },
          { type: ObjectType.BLOCK, x: 2500, y: 30 },
          { type: ObjectType.BLOCK, x: 2500, y: 180 },
          { type: ObjectType.BLOCK, x: 2500, y: 210 },
          { type: ObjectType.BLOCK, x: 2800, y: 120 },
          { type: ObjectType.BLOCK, x: 2830, y: 120 },
          { type: ObjectType.SPIKE, x: 2800, y: 90, rotation: 180 },
          { type: ObjectType.PORTAL_CUBE, x: 3100, y: 30 },
          { type: ObjectType.PAD_YELLOW, x: 3250, y: 0 },
          { type: ObjectType.BLOCK, x: 3400, y: 90 },
          { type: ObjectType.BLOCK, x: 3430, y: 90 },
          { type: ObjectType.END_TRIGGER, x: 3800, y: 0, width: 40, height: 400 }
        ]
      },

      // 2. CYBER SONIC by PixelMaster
      {
        id: 'comm_cyber_sonic',
        name: 'Cyber Sonic',
        creator: 'PixelMaster',
        difficulty: 'Hard',
        stars: 3,
        bpm: 144,
        length: 5200,
        bgColor: '#031c12',
        groundColor: '#063321',
        objects: [
          { type: ObjectType.PORTAL_SPEED_FAST, x: 200, y: 30 },
          { type: ObjectType.SPIKE, x: 400, y: 0 },
          { type: ObjectType.SPIKE, x: 430, y: 0 },
          { type: ObjectType.ORB_YELLOW, x: 600, y: 60 },
          { type: ObjectType.BLOCK, x: 750, y: 60 },
          { type: ObjectType.BLOCK, x: 780, y: 60 },
          { type: ObjectType.PORTAL_WAVE, x: 1000, y: 30 },
          // Коридор хвилі
          { type: ObjectType.BLOCK, x: 970, y: 210 },
          { type: ObjectType.BLOCK, x: 1000, y: 210 },
          { type: ObjectType.BLOCK, x: 1030, y: 210 },
          { type: ObjectType.BLOCK, x: 1060, y: 210 },
          { type: ObjectType.BLOCK, x: 1090, y: 210 },
          { type: ObjectType.BLOCK, x: 1120, y: 210 },
          { type: ObjectType.BLOCK, x: 1150, y: 210 },
          { type: ObjectType.BLOCK, x: 1180, y: 210 },
          { type: ObjectType.BLOCK, x: 1210, y: 210 },
          { type: ObjectType.BLOCK, x: 1240, y: 210 },
          { type: ObjectType.BLOCK, x: 1270, y: 210 },
          { type: ObjectType.BLOCK, x: 1300, y: 210 },
          { type: ObjectType.BLOCK, x: 1330, y: 210 },
          { type: ObjectType.BLOCK, x: 1360, y: 210 },
          { type: ObjectType.BLOCK, x: 1390, y: 210 },
          { type: ObjectType.BLOCK, x: 1420, y: 210 },
          { type: ObjectType.BLOCK, x: 1450, y: 210 },
          { type: ObjectType.BLOCK, x: 1480, y: 210 },
          { type: ObjectType.BLOCK, x: 1510, y: 210 },
          { type: ObjectType.SPIKE, x: 1200, y: 0 },
          { type: ObjectType.SPIKE, x: 1350, y: 180, rotation: 180 },
          { type: ObjectType.COIN, x: 1400, y: 100 },
          { type: ObjectType.PORTAL_UFO, x: 1600, y: 30 },
          { type: ObjectType.BLOCK, x: 1800, y: 0 },
          { type: ObjectType.BLOCK, x: 1800, y: 30 },
          { type: ObjectType.BLOCK, x: 1800, y: 180 },
          { type: ObjectType.BLOCK, x: 1800, y: 210 },
          { type: ObjectType.BLOCK, x: 2050, y: 0 },
          { type: ObjectType.BLOCK, x: 2050, y: 60 },
          { type: ObjectType.BLOCK, x: 2050, y: 210 },
          { type: ObjectType.PORTAL_CUBE, x: 2300, y: 30 },
          { type: ObjectType.PAD_RED, x: 2450, y: 0 },
          { type: ObjectType.SPIKE, x: 2600, y: 0 },
          { type: ObjectType.SPIKE, x: 2630, y: 0 },
          { type: ObjectType.END_TRIGGER, x: 2900, y: 0, width: 40, height: 400 }
        ]
      },

      // 3. FIRE AURA by DragonGD
      {
        id: 'comm_fire_aura',
        name: 'Fire Aura',
        creator: 'DragonGD',
        difficulty: 'Harder',
        stars: 5,
        bpm: 148,
        length: 5500,
        bgColor: '#260c02',
        groundColor: '#3d1505',
        objects: [
          { type: ObjectType.SPIKE, x: 380, y: 0 },
          { type: ObjectType.SPIKE, x: 410, y: 0 },
          { type: ObjectType.ORB_RED, x: 550, y: 60 },
          { type: ObjectType.BLOCK, x: 700, y: 90 },
          { type: ObjectType.BLOCK, x: 730, y: 90 },
          { type: ObjectType.BLOCK, x: 760, y: 90 },
          { type: ObjectType.COIN, x: 730, y: 140 },
          { type: ObjectType.SPIKE, x: 760, y: 120 },
          { type: ObjectType.PAD_PINK, x: 950, y: 0 },
          { type: ObjectType.PORTAL_GRAVITY_UP, x: 1100, y: 30 },
          { type: ObjectType.BLOCK, x: 1150, y: 180 },
          { type: ObjectType.BLOCK, x: 1180, y: 180 },
          { type: ObjectType.BLOCK, x: 1210, y: 180 },
          { type: ObjectType.BLOCK, x: 1240, y: 180 },
          { type: ObjectType.SPIKE, x: 1350, y: 150, rotation: 180 },
          { type: ObjectType.PORTAL_GRAVITY_DOWN, x: 1500, y: 90 },
          { type: ObjectType.PORTAL_SHIP, x: 1700, y: 30 },
          { type: ObjectType.BLOCK, x: 1850, y: 0 },
          { type: ObjectType.BLOCK, x: 1850, y: 30 },
          { type: ObjectType.BLOCK, x: 1850, y: 60 },
          { type: ObjectType.BLOCK, x: 2100, y: 120 },
          { type: ObjectType.BLOCK, x: 2100, y: 150 },
          { type: ObjectType.BLOCK, x: 2100, y: 180 },
          { type: ObjectType.PORTAL_CUBE, x: 2400, y: 30 },
          { type: ObjectType.PAD_YELLOW, x: 2550, y: 0 },
          { type: ObjectType.ORB_YELLOW, x: 2700, y: 120 },
          { type: ObjectType.END_TRIGGER, x: 3000, y: 0, width: 40, height: 400 }
        ]
      }
    ];
  }
}
