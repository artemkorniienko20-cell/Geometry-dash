export class InputManager {
  private keysDown: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private keysJustReleased: Set<string> = new Set();

  private isPointerDown: boolean = false;
  private pointerJustDown: boolean = false;
  private pointerJustUp: boolean = false;

  public pointerPosition: { x: number; y: number } = { x: 0, y: 0 };
  public rightClicked: boolean = false;
  public wheelDeltaX: number = 0;
  public wheelDeltaY: number = 0;

  private targetElement: HTMLElement | Window;

  constructor(targetElement: HTMLElement | Window = window) {
    this.targetElement = targetElement;
    this.initListeners();
  }

  private initListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent default scrolling for Space, Arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (!this.keysDown.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysDown.add(e.code);
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keysDown.delete(e.code);
      this.keysJustReleased.add(e.code);
    });

    const el = this.targetElement instanceof Window ? document.body : this.targetElement;

    el.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) {
        if (!this.isPointerDown) {
          this.pointerJustDown = true;
        }
        this.isPointerDown = true;
      } else if (e.button === 2) {
        this.rightClicked = true;
      }
      this.updatePointerPos(e);
    });

    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0) {
        this.isPointerDown = false;
        this.pointerJustUp = true;
      }
      this.updatePointerPos(e);
    });

    el.addEventListener('mousemove', (e: MouseEvent) => {
      this.updatePointerPos(e);
    });

    el.addEventListener('contextmenu', (e: MouseEvent) => {
      // Suppress browser context menu on canvas for editor right-click functionality
      e.preventDefault();
    });

    el.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        if (!this.isPointerDown) {
          this.pointerJustDown = true;
        }
        this.isPointerDown = true;
        const touch = e.touches[0];
        this.updateTouchPos(touch);
      }
    }, { passive: false });

    window.addEventListener('touchend', (e: TouchEvent) => {
      if (e.touches.length === 0) {
        this.isPointerDown = false;
        this.pointerJustUp = true;
      }
    });

    el.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        this.updateTouchPos(e.touches[0]);
      }
    }, { passive: false });

    window.addEventListener('wheel', (e: WheelEvent) => {
      this.wheelDeltaY += e.deltaY;
      this.wheelDeltaX += e.deltaX;
    }, { passive: true });
  }

  private updatePointerPos(e: MouseEvent): void {
    this.pointerPosition.x = e.clientX;
    this.pointerPosition.y = e.clientY;
  }

  private updateTouchPos(touch: Touch): void {
    this.pointerPosition.x = touch.clientX;
    this.pointerPosition.y = touch.clientY;
  }

  /**
   * Чи затиснута головна дія стрибка/польоту (Space, Up, W, або клік лівою кнопкою)
   */
  public isJumpHeld(): boolean {
    return (
      this.keysDown.has('Space') ||
      this.keysDown.has('ArrowUp') ||
      this.keysDown.has('KeyW') ||
      this.isPointerDown
    );
  }

  /**
   * Чи була щойно натиснута дія стрибка в цьому кадрі
   */
  public isJumpJustPressed(): boolean {
    return (
      this.keysJustPressed.has('Space') ||
      this.keysJustPressed.has('ArrowUp') ||
      this.keysJustPressed.has('KeyW') ||
      this.pointerJustDown
    );
  }

  public isPointerJustUp(): boolean {
    return this.pointerJustUp;
  }

  public isKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }

  public isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  /**
   * Викликається наприкінці кожного ігрового кадру для очищення станів 'justPressed'
   */
  public update(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.pointerJustDown = false;
    this.pointerJustUp = false;
    this.rightClicked = false;
    this.wheelDeltaX = 0;
    this.wheelDeltaY = 0;
  }
}
