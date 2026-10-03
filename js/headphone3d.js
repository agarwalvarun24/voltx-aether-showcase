/**
 * VOLTX AETHER-01 PRO // Real 3D WebGL Studio Headphone Engine
 * Procedural 3D luxury acoustic model built with Three.js.
 * True volumetric geometry, PBR metallic shaders, 360° orbit physics,
 * exploded deconstruction, and 3D-projected acoustic hotspots.
 */

class Headphone3DScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Container or THREE.js not available');
      return;
    }

    this.currentVariant = 'space-gray';
    this.isExploded = false;
    this.autoRotate = false;
    this.targetExplodeProgress = 0;
    this.explodeProgress = 0;

    // Orbit & Momentum Physics
    this.yaw = 0;
    this.pitch = 0.08;
    this.targetYaw = 0;
    this.targetPitch = 0.08;
    this.vx = 0;
    this.vy = 0;
    this.zoom = 4.3;
    this.targetZoom = 4.3;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.time = 0;
    this.idleTime = 0;

    this.materials = {};
    this.hotspots = [];

    this.initScene();
    this.buildHeadphoneGeometry();
    this.initHotspots();
    this.initEvents();
    this.animate();
  }

  initScene() {
    this.width = this.container.clientWidth || 560;
    this.height = this.container.clientHeight || 520;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, this.zoom);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Studio Lighting Rig
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    // Key Light (Top-Right Front)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(4, 5, 4);
    this.scene.add(this.keyLight);

    // Fill Light (Left Front Soft)
    this.fillLight = new THREE.DirectionalLight(0xa5c4e8, 1.4);
    this.fillLight.position.set(-4, 2, 3);
    this.scene.add(this.fillLight);

    // Rim / Backlight for Metallic Specular Silhouette
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    this.rimLight.position.set(0, 4, -4);
    this.scene.add(this.rimLight);

    // Subtle Under-Glow
    this.bottomLight = new THREE.DirectionalLight(0x18243b, 1.2);
    this.bottomLight.position.set(0, -4, 2);
    this.scene.add(this.bottomLight);
  }

  buildHeadphoneGeometry() {
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // Center the whole model at (0, 0, 0)
    this.modelGroup = new THREE.Group();
    this.modelGroup.position.set(0, -0.1, 0);
    this.rootGroup.add(this.modelGroup);

    // Materials definition
    this.materials.metalShell = new THREE.MeshStandardMaterial({
      color: 0x273142,
      metalness: 0.88,
      roughness: 0.26
    });

    this.materials.steelHeadband = new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      metalness: 0.95,
      roughness: 0.15
    });

    this.materials.canopyMesh = new THREE.MeshStandardMaterial({
      color: 0x0f1520,
      roughness: 0.92,
      metalness: 0.1
    });

    this.materials.cushionLeather = new THREE.MeshStandardMaterial({
      color: 0x0d121c,
      roughness: 0.85,
      metalness: 0.12
    });

    this.materials.driverAcoustic = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.7,
      roughness: 0.3
    });

    // 1. HEADBAND ARCH (Smooth Curving 3D Steel Tube)
    const curvePoints = [];
    const arcRadius = 1.15;
    for (let i = 0; i <= 32; i++) {
      const theta = (Math.PI * i) / 32;
      const x = -arcRadius * Math.cos(theta);
      const y = arcRadius * Math.sin(theta) * 0.95 + 0.25;
      curvePoints.push(new THREE.Vector3(x, y, 0));
    }
    const headbandCurve = new THREE.CatmullRomCurve3(curvePoints);
    const headbandGeom = new THREE.TubeGeometry(headbandCurve, 64, 0.045, 16, false);
    this.headbandMesh = new THREE.Mesh(headbandGeom, this.materials.steelHeadband);
    this.modelGroup.add(this.headbandMesh);

    // 2. BREATHABLE KNIT CANOPY (Floating Ergonomic Mesh Band Under Arch)
    const canopyPoints = [];
    const canopyRadius = 1.05;
    for (let i = 4; i <= 28; i++) {
      const theta = (Math.PI * i) / 32;
      const x = -canopyRadius * Math.cos(theta);
      const y = canopyRadius * Math.sin(theta) * 0.92 + 0.25;
      canopyPoints.push(new THREE.Vector3(x, y, 0));
    }
    const canopyCurve = new THREE.CatmullRomCurve3(canopyPoints);
    const canopyGeom = new THREE.TubeGeometry(canopyCurve, 32, 0.08, 12, false);
    this.canopyMesh = new THREE.Mesh(canopyGeom, this.materials.canopyMesh);
    this.modelGroup.add(this.canopyMesh);

    // 3. TELESCOPING STEMS (Stainless Steel Slider Arms)
    const stemGeom = new THREE.CylinderGeometry(0.038, 0.038, 0.55, 24);
    
    // Left stem
    const leftStem = new THREE.Mesh(stemGeom, this.materials.steelHeadband);
    leftStem.position.set(-1.14, 0.05, 0);
    this.modelGroup.add(leftStem);

    // Right stem
    const rightStem = new THREE.Mesh(stemGeom, this.materials.steelHeadband);
    rightStem.position.set(1.14, 0.05, 0);
    this.modelGroup.add(rightStem);

    // 4. EARCUPS (True 3D Volumetric Pods with Cushion, Anodized Shell, and Driver)
    this.leftEarcupGroup = new THREE.Group();
    this.leftEarcupGroup.position.set(-1.16, -0.4, 0);
    this.leftEarcupGroup.rotation.z = 0.15;
    this.modelGroup.add(this.leftEarcupGroup);

    this.rightEarcupGroup = new THREE.Group();
    this.rightEarcupGroup.position.set(1.16, -0.4, 0);
    this.rightEarcupGroup.rotation.z = -0.15;
    this.modelGroup.add(this.rightEarcupGroup);

    this.leftEarcupAssembly = this.createEarcupAssembly(true);
    this.leftEarcupGroup.add(this.leftEarcupAssembly.root);

    this.rightEarcupAssembly = this.createEarcupAssembly(false);
    this.rightEarcupGroup.add(this.rightEarcupAssembly.root);
  }

  createEarcupAssembly(isLeft) {
    const root = new THREE.Group();

    // Pivot Gimbal Ring
    const gimbalGeom = new THREE.TorusGeometry(0.18, 0.025, 16, 32, Math.PI);
    const gimbal = new THREE.Mesh(gimbalGeom, this.materials.steelHeadband);
    gimbal.rotation.x = Math.PI / 2;
    gimbal.position.set(0, 0.42, 0);
    root.add(gimbal);

    // A. Outer Anodized Aluminum Shell (Solid 3D Ellipsoid with genuine depth)
    const shellGeom = new THREE.SphereGeometry(0.48, 36, 36);
    shellGeom.scale(0.85, 1.25, 0.55);
    const shell = new THREE.Mesh(shellGeom, this.materials.metalShell);
    shell.position.set(0, 0, 0);
    root.add(shell);

    // B. Digital Crown Dial on Rim
    const crownGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 20);
    const crown = new THREE.Mesh(crownGeom, this.materials.steelHeadband);
    crown.position.set(isLeft ? -0.32 : 0.32, 0.48, 0.1);
    crown.rotation.z = isLeft ? 0.7 : -0.7;
    root.add(crown);

    // C. Internal 50mm Beryllium Driver Plate (Revealed in Exploded View)
    const driverGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
    driverGeom.rotateX(Math.PI / 2);
    const driver = new THREE.Mesh(driverGeom, this.materials.driverAcoustic);
    const driverOffset = isLeft ? -0.15 : 0.15;
    driver.position.set(0, 0, driverOffset);
    root.add(driver);

    // D. Plush Memory Foam Cushion (Inward facing ear cushion)
    const cushionGeom = new THREE.TorusGeometry(0.38, 0.14, 20, 36);
    cushionGeom.scale(0.8, 1.25, 0.75);
    const cushion = new THREE.Mesh(cushionGeom, this.materials.cushionLeather);
    const cushionOffset = isLeft ? -0.28 : 0.28;
    cushion.position.set(0, 0, cushionOffset);
    root.add(cushion);

    return { root, shell, driver, cushion, isLeft };
  }

  setVariant(variantKey) {
    this.currentVariant = variantKey;

    let shellColor, metalness, roughness, rimColor;

    if (variantKey === 'space-gray') {
      shellColor = 0x273142;
      metalness = 0.88;
      roughness = 0.26;
      rimColor = 0x38bdf8;
    } else if (variantKey === 'starlight-silver') {
      shellColor = 0xdce3ea;
      metalness = 0.94;
      roughness = 0.16;
      rimColor = 0xf1f5f9;
    } else if (variantKey === 'champagne-gold') {
      shellColor = 0xdba860;
      metalness = 0.84;
      roughness = 0.22;
      rimColor = 0xfbbf24;
    }

    if (this.materials.metalShell) {
      this.materials.metalShell.color.setHex(shellColor);
      this.materials.metalShell.metalness = metalness;
      this.materials.metalShell.roughness = roughness;
    }

    if (this.rimLight) {
      this.rimLight.color.setHex(rimColor);
    }
  }

  setExploded(isExploded) {
    this.isExploded = isExploded;
    this.targetExplodeProgress = isExploded ? 1.0 : 0.0;
  }

  initHotspots() {
    this.hotspotElements = [
      { id: 'hotspotDriver', element: document.getElementById('hotspotDriver'), localPos: new THREE.Vector3(-1.16, -0.4, 0.25) },
      { id: 'hotspotAnc', element: document.getElementById('hotspotAnc'), localPos: new THREE.Vector3(1.16, -0.4, 0.25) },
      { id: 'hotspotCanopy', element: document.getElementById('hotspotCanopy'), localPos: new THREE.Vector3(0, 1.25, 0) }
    ];
  }

  updateHotspots() {
    const tempV = new THREE.Vector3();
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    this.hotspotElements.forEach(item => {
      if (!item.element) return;
      tempV.copy(item.localPos);

      tempV.applyEuler(this.rootGroup.rotation);
      tempV.add(this.modelGroup.position);
      tempV.project(this.camera);

      const isFacing = tempV.z < 0.98;
      item.element.style.display = isFacing ? 'block' : 'none';

      const screenX = (tempV.x * halfWidth) + halfWidth;
      const screenY = -(tempV.y * halfHeight) + halfHeight;

      item.element.style.left = `${screenX}px`;
      item.element.style.top = `${screenY}px`;
    });
  }

  initEvents() {
    const onStart = (clientX, clientY) => {
      this.isDragging = true;
      this.lastX = clientX;
      this.lastY = clientY;
      this.vx = 0;
      this.vy = 0;
      this.container.style.cursor = 'grabbing';
      const hint = document.getElementById('viewportDragHint');
      if (hint) hint.style.opacity = '0';
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = clientX - this.lastX;
      const dy = clientY - this.lastY;
      this.lastX = clientX;
      this.lastY = clientY;

      this.vx = dx * 0.007;
      this.vy = dy * 0.006;

      this.targetYaw += this.vx;
      this.targetPitch = Math.max(-0.6, Math.min(0.6, this.targetPitch + this.vy));
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.container.style.cursor = 'grab';
    };

    this.container.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', onEnd);

    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetZoom = Math.max(3.0, Math.min(5.8, this.targetZoom + e.deltaY * 0.003));
    }, { passive: false });

    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    const autoRotateToggle = document.getElementById('autoRotateToggle');
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        autoRotateToggle.classList.toggle('active', this.autoRotate);
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time += 0.02;

    if (!this.isDragging) {
      this.targetYaw += this.vx;
      this.targetPitch += this.vy;
      this.vx *= 0.93;
      this.vy *= 0.93;

      if (this.autoRotate) {
        this.targetYaw += 0.012;
      } else {
        this.idleTime += 0.015;
        this.modelGroup.position.y = -0.1 + Math.sin(this.idleTime) * 0.04;
      }
    }

    this.yaw += (this.targetYaw - this.yaw) * 0.12;
    this.pitch += (this.targetPitch - this.pitch) * 0.12;
    this.zoom += (this.targetZoom - this.zoom) * 0.12;

    this.camera.position.z = this.zoom;

    this.rootGroup.rotation.y = this.yaw;
    this.rootGroup.rotation.x = this.pitch;

    this.explodeProgress += (this.targetExplodeProgress - this.explodeProgress) * 0.1;
    if (this.leftEarcupGroup && this.rightEarcupGroup) {
      const explodeDist = this.explodeProgress * 0.55;
      this.leftEarcupGroup.position.x = -1.16 - explodeDist;
      this.rightEarcupGroup.position.x = 1.16 + explodeDist;

      if (this.leftEarcupAssembly && this.rightEarcupAssembly) {
        this.leftEarcupAssembly.cushion.position.z = -0.28 - (this.explodeProgress * 0.35);
        this.leftEarcupAssembly.driver.position.z = -0.15 - (this.explodeProgress * 0.18);

        this.rightEarcupAssembly.cushion.position.z = 0.28 + (this.explodeProgress * 0.35);
        this.rightEarcupAssembly.driver.position.z = 0.15 + (this.explodeProgress * 0.18);
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.updateHotspots();
  }
}

window.Headphone3DScene = Headphone3DScene;