import { SoundEffects } from './SoundEffects';

export class AudioManager {
  public sfx: SoundEffects;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: any = null;

  // Музичний синтезатор
  private isMusicPlaying: boolean = false;
  private musicVolume: number = 0.6;
  private musicIntervalId: number | null = null;
  public bpm: number = 130;
  private currentStep: number = 0;

  // Зовнішнє користувацьке аудіо (MP3/WAV)
  private customAudioElement: HTMLAudioElement | null = null;
  private customAudioSource: MediaElementAudioSourceNode | null = null;
  private isCustomAudioActive: boolean = false;

  // Значення пульсації біту (від 0.0 до 1.0) для рендерера
  public beatPulse: number = 0;

  constructor() {
    this.sfx = new SoundEffects();
  }

  private initAudioContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = this.sfx.ensureContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Запуск вбудованого електронного саундтреку (EDM Synthwave 130 BPM)
   */
  public startMusic(resetStep: boolean = true): void {
    if (this.isMusicPlaying) return;
    this.initAudioContext();
    this.isMusicPlaying = true;

    if (this.isCustomAudioActive && this.customAudioElement) {
      this.customAudioElement.currentTime = 0;
      this.customAudioElement.play().catch(e => console.warn('Custom audio play error', e));
      return;
    }

    if (resetStep) {
      this.currentStep = 0;
    }

    // Крок 16-ї ноти при 130 BPM = (60 / 130 / 4) * 1000 ≈ 115.38 ms
    const stepDuration = (60 / this.bpm / 4) * 1000;

    this.musicIntervalId = window.setInterval(() => {
      this.playSynthStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 64;
    }, stepDuration);
  }

  public setBPM(bpm: number): void {
    this.bpm = bpm;
    if (this.isMusicPlaying && !this.isCustomAudioActive) {
      if (this.musicIntervalId !== null) {
        clearInterval(this.musicIntervalId);
        const stepDuration = (60 / this.bpm / 4) * 1000;
        this.musicIntervalId = window.setInterval(() => {
          this.playSynthStep(this.currentStep);
          this.currentStep = (this.currentStep + 1) % 64;
        }, stepDuration);
      }
    }
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
    this.beatPulse = 0;
  }

  public resetMusic(): void {
    this.stopMusic();
    this.currentStep = 0;
  }

  /**
   * Завантаження власного MP3/WAV файлу
   */
  public loadCustomAudioFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const ctx = this.initAudioContext();
        const url = URL.createObjectURL(file);
        
        if (this.customAudioElement) {
          this.customAudioElement.pause();
          this.customAudioElement.src = '';
        }

        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        audio.loop = true;

        if (!this.customAudioSource) {
          this.customAudioSource = ctx.createMediaElementSource(audio);
          if (this.analyser) {
            this.customAudioSource.connect(this.analyser);
            this.analyser.connect(ctx.destination);
          }
        }

        this.customAudioElement = audio;
        this.isCustomAudioActive = true;
        resolve(file.name);
      } catch (err) {
        reject(err);
      }
    });
  }

  public disableCustomAudio(): void {
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
    this.isCustomAudioActive = false;
  }

  /**
   * Крок синтезу такту саундтреку (EDM бочка, снейр, басова лінія та мелодія)
   */
  private playSynthStep(step: number): void {
    if (!this.ctx || this.sfx.isMuted) return;
    const now = this.ctx.currentTime;
    const isQuarter = step % 4 === 0;

    // 1. Kick Drum (Кожні 4 кроки: 0, 4, 8, 12... - 4 on the floor)
    if (isQuarter) {
      this.triggerKick(now);
      this.beatPulse = 1.0; // Максимальний імпульс пульсації для графіки
    }

    // 2. Snare / Clap (на 4 і 12 кроках кожного такту)
    const measureStep = step % 16;
    if (measureStep === 4 || measureStep === 12) {
      this.triggerSnare(now);
      this.beatPulse = Math.max(this.beatPulse, 0.85);
    }

    // 3. Hi-hat (кожні непарні 2 кроки)
    if (step % 2 === 1) {
      this.triggerHiHat(now);
    }

    // 4. Bassline (пульсуючий ретро-бас)
    const bassScale = [55, 55, 65.41, 73.42, 55, 49, 65.41, 73.42]; // A1, C2, D2...
    const noteIndex = Math.floor(step / 8) % bassScale.length;
    const baseFreq = bassScale[noteIndex];
    if (step % 2 === 0) {
      this.triggerBass(now, baseFreq);
    }

    // 5. Arpeggio / Lead (епічний енергійний синт)
    const arpNotes = [220, 261.63, 329.63, 440, 329.63, 261.63, 392, 329.63];
    const arpFreq = arpNotes[step % arpNotes.length];
    this.triggerLead(now, arpFreq);
  }

  private triggerKick(time: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);

    gain.gain.setValueAtTime(this.musicVolume * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    if (this.analyser) gain.connect(this.analyser);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.32);
  }

  private triggerSnare(time: number): void {
    if (!this.ctx) return;
    // Тон снейру + шум
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);

    gain.gain.setValueAtTime(this.musicVolume * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private triggerHiHat(time: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(7000, time);

    gain.gain.setValueAtTime(this.musicVolume * 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  private triggerBass(time: number, freq: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, time);
    filter.frequency.exponentialRampToValueAtTime(120, time + 0.2);

    gain.gain.setValueAtTime(this.musicVolume * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.23);
  }

  private triggerLead(time: number, freq: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(this.musicVolume * 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.19);
  }

  /**
   * Оновлення рівня пульсації в ігровому циклі (затухання з часом)
   */
  public update(dt: number): void {
    if (this.isCustomAudioActive && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      // Отримуємо басову частоту
      let bassSum = 0;
      for (let i = 0; i < 4; i++) {
        bassSum += this.dataArray[i];
      }
      const bassAvg = bassSum / 4;
      this.beatPulse = Math.max(this.beatPulse, bassAvg / 255);
    }

    // Плавне спадання пульсації
    this.beatPulse = Math.max(0, this.beatPulse - dt * 3.5);
  }
}
