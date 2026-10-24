export class Camera {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public zoom: number = 1.0;

  public screenWidth: number = 1280;
  public screenHeight: number = 720;

  // Тряска екрану (Screen Shake)
  private shakeDuration: number = 0;
  private shakeIntensity: number = 0;
  private shakeOffset: { x: number; y: number } = { x: 0, y: 0 };

  // Відступ гравця від лівого краю екрану
  public playerScreenOffsetX: number = 220;

  constructor(width: number = 1280, height: number = 720) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  public resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.playerScreenOffsetX = Math.max(160, width * 0.22);
  }

  public triggerShake(intensity: number = 12, duration: number = 0.25): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  // Вертикальний відступ підлоги від низу екрана (~180px)
  public baseGroundOffset: number = 180;

  public update(playerX: number, playerY: number, dt: number, smoothVertical: boolean = true): void {
    // Горизонтальне слідування — фіксований зв'язок з гравцем
    this.targetX = playerX - this.playerScreenOffsetX;
    this.x = this.targetX;

    // Вертикальне слідування: плавний lerp
    const desiredCameraY = playerY - this.baseGroundOffset;

    if (smoothVertical) {
      const lerpSpeed = 5.0 * dt;
      this.y += (Math.max(-this.baseGroundOffset, desiredCameraY) - this.y) * Math.min(1.0, lerpSpeed);
    } else {
      this.y = Math.max(-this.baseGroundOffset, desiredCameraY);
    }

    // Оновлення тремтіння екрану
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const currentIntensity = this.shakeIntensity * Math.max(0, this.shakeDuration / 0.25);
      this.shakeOffset.x = (Math.random() - 0.5) * currentIntensity * 2;
      this.shakeOffset.y = (Math.random() - 0.5) * currentIntensity * 2;
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }
  }

  /**
   * Переведення світових координат у координати Canvas
   */
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX - this.x) + this.shakeOffset.x,
      y: (this.screenHeight - (worldY - this.y)) + this.shakeOffset.y // інверсія осі Y: у грі 0 - підлога, вгору - додатні Y
    };
  }

  /**
   * Переведення координат Canvas у координати ігрового світу (для редактора)
   */
  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.shakeOffset.x) + this.x,
      y: (this.screenHeight - (screenY - this.shakeOffset.y)) + this.y
    };
  }
}
