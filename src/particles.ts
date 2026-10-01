export type VariantKey = 'obsidian-cyan' | 'solar-sunset' | 'aurora-emerald';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulseSpeed: number;
  pulseVal: number;
}

export class AtmosphericCanvasTS {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private readonly particleCount = 65;
  private mouse = { x: -1000, y: -1000, radius: 150 };
  private currentColor = { r: 255, g: 126, b: 41 };

  constructor(canvasId: string) {
    const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!el) throw new Error(`Canvas #${canvasId} not found`);
    this.canvas = el;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Could not obtain 2D context');
    this.ctx = context;

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  public resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createParticles(): void {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.7 - 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  public setVariantColor(variant: VariantKey): void {
    if (variant === 'solar-sunset') {
      this.currentColor = { r: 255, g: 126, b: 41 };
    } else if (variant === 'aurora-emerald') {
      this.currentColor = { r: 0, g: 255, b: 163 };
    } else {
      this.currentColor = { r: 0, g: 242, b: 254 };
    }
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  private animate = (): void => {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    const { r, g, b } = this.currentColor;

    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulseVal += p.pulseSpeed;

      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.mouse.radius) {
        const force = (1 - dist / this.mouse.radius) * 1.5;
        p.x -= (dx / dist) * force;
        p.y -= (dy / dist) * force;
      }

      if (p.y < 0) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const currentAlpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulseVal));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
      this.ctx.shadowBlur = p.size > 2 ? 8 : 4;
      this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      this.ctx.fill();
    }
    requestAnimationFrame(this.animate);
  };
}