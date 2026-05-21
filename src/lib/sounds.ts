/**
 * Web Audio API based sound generator for Quick Math
 */
class SoundService {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5;
  private isMuted: boolean = false;

  constructor() {
    // Resume context on first interaction
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('qm_volume');
      const savedMute = localStorage.getItem('qm_muted');
      if (savedVolume !== null) this.volume = parseFloat(savedVolume);
      if (savedMute !== null) this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolume(val: number) {
    this.volume = val / 100;
    localStorage.setItem('qm_volume', this.volume.toString());
  }

  setMuted(val: boolean) {
    this.isMuted = val;
    localStorage.setItem('qm_muted', val.toString());
  }

  getSettings() {
    return { volume: this.volume * 100, isMuted: this.isMuted };
  }

  private playTone(freq: number | number[], type: OscillatorType, duration: number, ramp: 'up' | 'down' | 'none' = 'none') {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    gain.gain.setValueAtTime(this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const freqs = Array.isArray(freq) ? freq : [freq];
    
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(f, now);
      
      if (ramp === 'up') {
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + duration);
      } else if (ramp === 'down') {
        osc.frequency.exponentialRampToValueAtTime(f * 0.5, now + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  correct() {
    this.playTone(800, 'sine', 0.15, 'up');
  }

  wrong() {
    this.playTone(200, 'sawtooth', 0.2, 'down');
  }

  streak3() {
    this.playTone([600, 900], 'sine', 0.3);
  }

  streak5() {
    const ctx = this.initCtx();
    if (this.isMuted) return;
    const now = ctx.currentTime;
    [400, 600, 800].forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.15);
      }, i * 100);
    });
  }

  streak10() {
    this.playTone(1000, 'square', 0.5);
  }

  timerAlert() {
    this.playTone(700, 'sine', 0.1);
  }

  gameOver() {
    const ctx = this.initCtx();
    if (this.isMuted) return;
    [440, 554.37, 659.25, 880].forEach((f, i) => {
       setTimeout(() => {
        this.playTone(f, 'sine', 0.4);
      }, i * 150);
    });
  }

  tap() {
    this.playTone(400, 'sine', 0.08);
  }

  levelUp() {
    const ctx = this.initCtx();
    if (this.isMuted) return;
    // C5 - E5 - G5 - C6 rapid arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.12, 'up');
      }, i * 80);
    });
  }
}

export const sounds = new SoundService();
