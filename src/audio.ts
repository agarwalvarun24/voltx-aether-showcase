export type AudioModeKey = 'spatial' | 'studio' | 'bass';

export class SoundstageEngineTS {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = true;
  private readonly visualizerCanvas: HTMLCanvasElement | null;
  private readonly ctx: CanvasRenderingContext2D | null = null;
  private phase: number = 0;
  private currentMode: AudioModeKey = 'spatial';

  constructor(canvasId: string) {
    this.visualizerCanvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (this.visualizerCanvas) {
      this.ctx = this.visualizerCanvas.getContext('2d');
      this.renderVisualizer();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) this.playTone(523.25, 'sine', 0.18);
    return this.isMuted;
  }

  public setMode(mode: AudioModeKey): void {
    this.currentMode = mode;
    if (mode === 'spatial') this.playTone(523.25, 'sine', 0.2);
    else if (mode === 'studio') this.playTone(440.0, 'triangle', 0.2);
    else if (mode === 'bass') this.playTone(110.0, 'sawtooth', 0.25);
  }

  public playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.12): void {
    if (this.isMuted) return;
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') this.audioContext.resume();

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch {
      // Audio permission policy
    }
  }

  private renderVisualizer = (): void => {
    if (!this.visualizerCanvas || !this.ctx) return;
    const canvas = this.visualizerCanvas;
    const ctx = this.ctx;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    const stroke = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#ff7e29';

    const numBars = 32;
    const barWidth = (w / numBars) - 2;

    for (let i = 0; i < numBars; i++) {
      let amp = 0.65;
      if (this.currentMode === 'bass' && i < 10) amp = 1.35;
      if (this.currentMode === 'spatial') amp = 0.95;

      const waveHeight = (Math.sin(this.phase + i * 0.35) * 0.5 + 0.5) * (h * 0.7 * amp) + 4;
      const x = i * (barWidth + 2);
      const y = h - waveHeight;

      const grad = ctx.createLinearGradient(0, y, 0, h);
      grad.addColorStop(0, stroke);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, waveHeight);
    }
    this.phase += 0.08;
    requestAnimationFrame(this.renderVisualizer);
  };
}