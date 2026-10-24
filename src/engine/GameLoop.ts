export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  public readonly fixedStep: number = 1 / 120; // 120 Hz для абсолютно точної фізики
  private isRunning: boolean = false;
  private animFrameId: number | null = null;

  private onUpdate: (dt: number) => void;
  private onRender: (interpolation: number) => void;

  constructor(
    onUpdate: (dt: number) => void,
    onRender: (interpolation: number) => void
  ) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    let delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Захист від занадто великої дельти при переході між вкладками браузера (max 0.1s)
    if (delta > 0.1) {
      delta = 0.1;
    }

    this.accumulator += delta;

    while (this.accumulator >= this.fixedStep) {
      this.onUpdate(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    const interpolation = this.accumulator / this.fixedStep;
    this.onRender(interpolation);

    this.animFrameId = requestAnimationFrame(this.loop);
  };
}
