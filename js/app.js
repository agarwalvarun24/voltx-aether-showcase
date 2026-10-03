/**
 * VOLTX AETHER-01 PRO // Interactive 3D Orbit & Physics Engine
 * Handles 360° Drag-to-Rotate, Inertia Momentum, Idle 3D Floating,
 * Auto-Turntable Orbit, and Mouse Parallax.
 */

class Interactive3DStage {
  constructor(viewportId, tiltWrapperId) {
    this.viewport = document.getElementById(viewportId);
    this.tiltWrapper = document.getElementById(tiltWrapperId);
    if (!this.viewport || !this.tiltWrapper) return;

    // 3D Angles and Momentum
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.vx = 0;
    this.vy = 0;
    
    // Zoom and Float
    this.zoom = 1;
    this.targetZoom = 1;
    this.floatY = 0;
    this.time = 0;

    // Interaction Flags
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.autoRotate = false;
    this.mouseParallaxX = 0;
    this.mouseParallaxY = 0;

    this.dragHint = document.getElementById('viewportDragHint');
    this.leftEarcup = document.getElementById('leftEarcupGroup');
    this.rightEarcup = document.getElementById('rightEarcupGroup');

    this.initEvents();
    this.startLoop();
  }

  initEvents() {
    // 1. Drag to Rotate (Mouse & Touch)
    const onStart = (clientX, clientY) => {
      this.isDragging = true;
      this.lastX = clientX;
      this.lastY = clientY;
      this.vx = 0;
      this.vy = 0;
      this.tiltWrapper.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      if (this.dragHint) this.dragHint.style.opacity = '0';
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = clientX - this.lastX;
      const dy = clientY - this.lastY;
      this.lastX = clientX;
      this.lastY = clientY;

      // Track rotational velocity for inertia fling
      this.vx = dx * 0.45;
      this.vy = -dy * 0.35;

      this.targetYaw += this.vx;
      this.targetPitch = Math.max(-35, Math.min(35, this.targetPitch + this.vy));
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.tiltWrapper.style.cursor = 'grab';
      document.body.style.userSelect = '';
    };

    // Viewport & Window Mouse Listeners
    this.viewport.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        onMove(e.clientX, e.clientY);
      } else {
        // Global subtle window parallax
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        this.mouseParallaxX = ((e.clientX - cx) / cx) * 12;
        this.mouseParallaxY = ((e.clientY - cy) / cy) * 8;
      }
    });
    window.addEventListener('mouseup', onEnd);

    // Touch Support for Mobile / Tablets
    this.viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', onEnd);

    // 2. Mouse Wheel to Zoom in/out
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetZoom = Math.max(0.82, Math.min(1.35, this.targetZoom - e.deltaY * 0.001));
    }, { passive: false });

    // 3. Auto-Rotate Turntable Toggle Button
    const autoRotateToggle = document.getElementById('autoRotateToggle');
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        autoRotateToggle.classList.toggle('active', this.autoRotate);
      });
    }
  }

  startLoop() {
    const loop = () => {
      this.time += 0.025;

      // Inertia Momentum Physics
      if (!this.isDragging) {
        this.targetYaw += this.vx;
        this.targetPitch = Math.max(-35, Math.min(35, this.targetPitch + this.vy));
        this.vx *= 0.94; // friction decay
        this.vy *= 0.94;

        if (this.autoRotate) {
          // Continuous 360° turntable spin
          this.targetYaw += 0.85;
        } else {
          // Natural 3D floating and breathing motion
          this.floatY = Math.sin(this.time) * 10;
        }
      }

      // Smooth Lerp Damping
      const idleYaw = this.autoRotate ? 0 : Math.sin(this.time * 0.8) * 6;
      const idlePitch = this.autoRotate ? 0 : Math.cos(this.time * 0.6) * 4;

      this.yaw += ((this.targetYaw + idleYaw + this.mouseParallaxX) - this.yaw) * 0.12;
      this.pitch += ((this.targetPitch + idlePitch - this.mouseParallaxY) - this.pitch) * 0.12;
      this.zoom += (this.targetZoom - this.zoom) * 0.12;

      // Apply 3D Transform to Headphone Container
      this.tiltWrapper.style.transform = `
        perspective(1200px)
        translateY(${this.floatY.toFixed(2)}px)
        rotateX(${this.pitch.toFixed(2)}deg)
        rotateY(${this.yaw.toFixed(2)}deg)
        scale(${this.zoom.toFixed(3)})
      `;

      // 3D Parallax & Depth Cues on Earcups
      if (this.leftEarcup && this.rightEarcup) {
        const rad = (this.yaw * Math.PI) / 180;
        const earcup3dOffset = Math.sin(rad) * 32;
        const scaleLeft = 1 + Math.sin(rad) * 0.14;
        const scaleRight = 1 - Math.sin(rad) * 0.14;

        this.leftEarcup.style.transform = `translate(${235 + earcup3dOffset}px, 480px) rotate(14deg) scale(${scaleLeft})`;
        this.rightEarcup.style.transform = `translate(${565 + earcup3dOffset}px, 480px) rotate(-14deg) scale(${scaleRight})`;
      }

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.atmosphericCanvas = new AtmosphericCanvas('particlesCanvas');
  window.showcaseController = new ShowcaseController();

  // Initialize Interactive 3D Stage with Physics & 360° Drag
  window.stage3D = new Interactive3DStage('productViewport', 'productTiltWrapper');

  // Custom Magnetic Cursor & Mouse Spotlight Tracking
  const cursor = document.getElementById('customCursor');
  const follower = document.getElementById('customCursorFollower');
  
  window.addEventListener('mousemove', (e) => {
    if (cursor && follower) {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      follower.style.left = `${e.clientX}px`;
      follower.style.top = `${e.clientY}px`;
    }
    document.documentElement.style.setProperty('--mouse-screen-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-screen-y', `${e.clientY}px`);
  });

  // Background Theme Switcher Engine
  const bgButtons = document.querySelectorAll('.bg-switcher-btn');
  window.setBackgroundTheme = function(themeName) {
    document.body.setAttribute('data-bg', themeName);
    bgButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });
  };

  bgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      if (theme) window.setBackgroundTheme(theme);
    });
  });

  // Keyboard Shortcuts (1, 2, 3 for variants; R for auto-rotate; E for exploded view; B for background)
  const bgThemes = ['studio', 'sunset', 'cyber'];
  let currentBgIdx = 0;

  window.addEventListener('keydown', (e) => {
    if (e.key === '1') window.showcaseController.setVariant('space-gray');
    if (e.key === '2') window.showcaseController.setVariant('starlight-silver');
    if (e.key === '3') window.showcaseController.setVariant('champagne-gold');
    if (e.key.toLowerCase() === 'e') window.showcaseController.toggleExplodedView();
    if (e.key.toLowerCase() === 'r') {
      const autoBtn = document.getElementById('autoRotateToggle');
      if (autoBtn) autoBtn.click();
    }
    if (e.key.toLowerCase() === 'b') {
      currentBgIdx = (currentBgIdx + 1) % bgThemes.length;
      window.setBackgroundTheme(bgThemes[currentBgIdx]);
    }
  });
});