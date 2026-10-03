const PRODUCT_VARIANTS_DATA = {
  'space-gray': {
    name: 'Space Gray',
    finish: 'Satin Brushed Titanium',
    desc: 'Precision-machined aerospace alloy with low-resonance acoustic dampening. Delivers uncolored, transparent sound reproduction.',
    accent: '#38bdf8',
    specs: { latency: '0.8 ms', playtime: '64 hrs', frequency: '5 Hz - 48 kHz', anc: '-46 dB' }
  },
  'starlight-silver': {
    name: 'Starlight Silver',
    finish: 'Anodized Matte Aluminum',
    desc: 'Micro-bead blasted aluminum earcups with bone-white memory acoustic cushions. Engineered for airy soundstage separation.',
    accent: '#f1f5f9',
    specs: { latency: '0.8 ms', playtime: '64 hrs', frequency: '5 Hz - 50 kHz', anc: '-45 dB' }
  },
  'champagne-gold': {
    name: 'Champagne Gold',
    finish: 'Nordic Warm Alloy & Amber Leather',
    desc: 'Warm luxury champagne finish with enhanced harmonic resonance. Tuned for lush vocals and analog warmth.',
    accent: '#fbbf24',
    specs: { latency: '0.9 ms', playtime: '68 hrs', frequency: '4 Hz - 48 kHz', anc: '-46 dB' }
  }
};

class ShowcaseController {
  constructor() {
    this.currentVariant = 'space-gray';
    this.isExploded = false;
    this.activeAudioMode = 'spatial';
    this.initElements();
    this.bindEvents();
    this.initAudioVisualizer();
  }

  initElements() {
    this.variantButtons = document.querySelectorAll('.variant-btn');
    this.variantStoryTitle = document.getElementById('variantStoryTitle');
    this.variantStoryDesc = document.getElementById('variantStoryDesc');
    this.productViewport = document.getElementById('productViewport');
    this.viewModeToggle = document.getElementById('viewModeToggle');
    this.audioModePills = document.querySelectorAll('.audio-mode-pill');
    this.compareModal = document.getElementById('compareModal');
    this.codeModal = document.getElementById('codeModal');
  }

  setVariant(variantKey) {
    if (!PRODUCT_VARIANTS_DATA[variantKey]) return;
    this.currentVariant = variantKey;
    const data = PRODUCT_VARIANTS_DATA[variantKey];

    document.body.setAttribute('data-variant', variantKey);

    this.variantButtons.forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-variant') === variantKey);
    });

    if (this.variantStoryTitle && this.variantStoryDesc) {
      this.variantStoryTitle.textContent = `${data.name} // ${data.finish}`;
      this.variantStoryDesc.textContent = data.desc;
    }

    const specLatency = document.getElementById('specLatency');
    const specPlaytime = document.getElementById('specPlaytime');
    const specFreq = document.getElementById('specFreq');
    const specAnc = document.getElementById('specAnc');

    if (specLatency) specLatency.innerHTML = `${data.specs.latency.split(' ')[0]} <span class="unit">${data.specs.latency.split(' ')[1]}</span>`;
    if (specPlaytime) specPlaytime.innerHTML = `${data.specs.playtime.split(' ')[0]} <span class="unit">${data.specs.playtime.split(' ')[1]}</span>`;
    if (specFreq) specFreq.innerHTML = `${data.specs.frequency} <span class="unit">BANDWIDTH</span>`;
    if (specAnc) specAnc.innerHTML = `${data.specs.anc.split(' ')[0]} <span class="unit">${data.specs.anc.split(' ')[1]}</span>`;

    if (window.atmosphericCanvas) window.atmosphericCanvas.setVariantColor(variantKey);
  }

  toggleExplodedView() {
    this.isExploded = !this.isExploded;
    if (this.productViewport) {
      this.productViewport.classList.toggle('exploded-active', this.isExploded);
    }
    if (this.viewModeToggle) {
      this.viewModeToggle.classList.toggle('active', this.isExploded);
    }
  }

  initAudioVisualizer() {
    const canvas = document.getElementById('audioVisualizerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const stroke = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#38bdf8';

      const numBars = 28;
      const barWidth = (canvas.width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        let amp = 0.65;
        if (this.activeAudioMode === 'bass') amp = 1.25;
        const wave = (Math.sin(phase + i * 0.35) * 0.5 + 0.5) * (canvas.height * 0.65 * amp) + 4;
        ctx.fillStyle = stroke;
        ctx.fillRect(i * (barWidth + 2), canvas.height - wave, barWidth, wave);
      }
      phase += 0.08;
      requestAnimationFrame(render);
    };
    render();
  }

  bindEvents() {
    this.variantButtons.forEach(btn => {
      btn.addEventListener('click', () => this.setVariant(btn.getAttribute('data-variant')));
    });

    if (this.viewModeToggle) {
      this.viewModeToggle.addEventListener('click', () => this.toggleExplodedView());
    }

    const heroExplodedBtn = document.getElementById('btnHeroExploded');
    if (heroExplodedBtn) {
      heroExplodedBtn.addEventListener('click', () => this.toggleExplodedView());
    }

    document.querySelectorAll('.hotspot-anchor').forEach(hotspot => {
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = hotspot.classList.contains('active');
        document.querySelectorAll('.hotspot-anchor').forEach(el => el.classList.remove('active'));
        if (!active) hotspot.classList.add('active');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.hotspot-anchor').forEach(c => c.classList.remove('active'));
    });

    this.audioModePills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.audioModePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const text = pill.textContent.trim().toLowerCase();
        this.activeAudioMode = text.includes('bass') || text.includes('vinyl') ? 'bass' : 'spatial';
      });
    });

    const openCompare = document.getElementById('btnOpenCompare');
    const closeCompare = document.getElementById('btnCloseCompare');
    if (openCompare && this.compareModal) openCompare.addEventListener('click', () => this.compareModal.classList.add('open'));
    if (closeCompare && this.compareModal) closeCompare.addEventListener('click', () => this.compareModal.classList.remove('open'));

    const openCode = document.getElementById('btnOpenCode');
    const closeCode = document.getElementById('btnCloseCode');
    if (openCode && this.codeModal) openCode.addEventListener('click', () => this.codeModal.classList.add('open'));
    if (closeCode && this.codeModal) closeCode.addEventListener('click', () => this.codeModal.classList.remove('open'));
  }
}

window.ShowcaseController = ShowcaseController;