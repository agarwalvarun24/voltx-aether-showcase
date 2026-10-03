class AtmosphericCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 60;
    this.mouse = { x: -1000, y: -1000, radius: 150 };
    this.currentColor = { r: 255, g: 126, b: 41 };

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.7 - 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  setVariantColor(colorType) {
    if (colorType === 'solar-sunset') this.currentColor = { r: 255, g: 126, b: 41 };
    else if (colorType === 'aurora-emerald') this.currentColor = { r: 0, g: 255, b: 163 };
    else this.currentColor = { r: 0, g: 242, b: 254 };
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.createParticles(); });
    window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { r, g, b } = this.currentColor;

    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulseVal += 0.02;

      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.mouse.radius) {
        const force = (1 - dist / this.mouse.radius) * 1.5;
        p.x -= (dx / dist) * force;
        p.y -= (dy / dist) * force;
      }

      if (p.y < 0) { p.y = this.height + 10; p.x = Math.random() * this.width; }
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;

      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulseVal));
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;
    requestAnimationFrame(() => this.animate());
  }
}
window.AtmosphericCanvas = AtmosphericCanvas;