export enum ObjectType {
  BLOCK = 'BLOCK',
  HALF_BLOCK = 'HALF_BLOCK',
  SPIKE = 'SPIKE',
  HALF_SPIKE = 'HALF_SPIKE',
  HANGING_SPIKE = 'HANGING_SPIKE',

  ORB_YELLOW = 'ORB_YELLOW',
  ORB_PINK = 'ORB_PINK',
  ORB_RED = 'ORB_RED',
  ORB_BLUE = 'ORB_BLUE',

  PAD_YELLOW = 'PAD_YELLOW',
  PAD_PINK = 'PAD_PINK',
  PAD_RED = 'PAD_RED',
  PAD_BLUE = 'PAD_BLUE',

  PORTAL_CUBE = 'PORTAL_CUBE',
  PORTAL_SHIP = 'PORTAL_SHIP',
  PORTAL_BALL = 'PORTAL_BALL',
  PORTAL_UFO = 'PORTAL_UFO',
  PORTAL_WAVE = 'PORTAL_WAVE',

  PORTAL_GRAVITY_DOWN = 'PORTAL_GRAVITY_DOWN',
  PORTAL_GRAVITY_UP = 'PORTAL_GRAVITY_UP',

  PORTAL_SPEED_SLOW = 'PORTAL_SPEED_SLOW',       // 0.5x
  PORTAL_SPEED_NORMAL = 'PORTAL_SPEED_NORMAL',   // 1.0x
  PORTAL_SPEED_FAST = 'PORTAL_SPEED_FAST',       // 2.0x
  PORTAL_SPEED_VERY_FAST = 'PORTAL_SPEED_VERY_FAST', // 3.0x
  PORTAL_SPEED_INSANE = 'PORTAL_SPEED_INSANE',   // 4.0x

  COIN = 'COIN',
  END_TRIGGER = 'END_TRIGGER'
}

export interface GameObjectData {
  id?: string;
  type: ObjectType;
  x: number;
  y: number;
  rotation?: number; // 0, 90, 180, 270 градусів
  width?: number;
  height?: number;
}

export class GameObject {
  public id: string;
  public type: ObjectType;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public rotation: number; // 0, 90, 180, 270

  // Стан для одноразових взаємодій
  public activated: boolean = false;

  constructor(data: GameObjectData) {
    this.id = data.id || Math.random().toString(36).substring(2, 9);
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.rotation = data.rotation || 0;

    // Стандартні розміри на сітці (30x30 для блоків і шипів)
    this.width = data.width || this.getDefaultWidth();
    this.height = data.height || this.getDefaultHeight();
  }

  private getDefaultWidth(): number {
    switch (this.type) {
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
      case ObjectType.PORTAL_SPEED_INSANE:
        return 36;
      case ObjectType.END_TRIGGER:
        return 30;
      default:
        return 30;
    }
  }

  private getDefaultHeight(): number {
    switch (this.type) {
      case ObjectType.HALF_BLOCK:
      case ObjectType.HALF_SPIKE:
        return 15;
      case ObjectType.PAD_YELLOW:
      case ObjectType.PAD_PINK:
      case ObjectType.PAD_RED:
      case ObjectType.PAD_BLUE:
        return 10;
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
      case ObjectType.PORTAL_SPEED_INSANE:
        return 90;
      case ObjectType.END_TRIGGER:
        return 300;
      default:
        return 30;
    }
  }

  public toJSON(): GameObjectData {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      width: this.width,
      height: this.height
    };
  }
}
