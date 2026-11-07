/**
 * ============================================================================
 * शुभ दीपावली – पंचायत सहायक यूनियन ज़िन्दाबाद
 * High-Performance, Silky Smooth 60FPS Engine
 * Sliced GFHGHF.mp3 & Synthetic Audio Engine with Auto-Play on First Gesture
 * Single Unified Canvas • Ultra-Lightweight & Battery-Friendly
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. GLOBAL STATE & CONFIGURATION
     ========================================================================== */
  const STATE = {
    audioEnabled: true, // Enabled by default as requested!
    audioContext: null,
    audioBuffer: null,
    audioBufferLoaded: false,
    ambientTimer: null,
    sparklerActive: true,
    isDiyaLit: true,
    chakris: [],
    anars: []
  };

  const DEDICATION_WISH = `🪔 *शुभ दीपावली – पंचायत सहायक यूनियन ज़िन्दाबाद!* ✨\n\n` +
    `*समस्त पंचायत सहायक साथियों को दीपोत्सव की हार्दिक शुभकामनाएं!*\n\n` +
    `गाँव के सजग प्रहरी, जनसेवा के निष्ठावान सारथी — आपके अथक परिश्रम और समर्पण को नमन। यह दीपोत्सव आपके जीवन में सुख, समृद्धि, सम्मान, नियमितीकरण और उज्ज्वल भविष्य का प्रकाश लेकर आए।\n\n` +
    `✦ *हमारा संघर्ष • हमारी एकता • हमारा सम्मान* ✦\n` +
    `॥ ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ॥\n\n` +
    `सौजन्य: *पंचायत सहायक यूनियन ज़िन्दाबाद* 🪔`;

  const CARD_MESSAGES = {
    1: `🌾 *कर्म एवं सेवा – पंचायत सहायक यूनियन ज़िन्दाबाद!*\n\nगाँव के हर जरूरतमंद तक सरकारी योजनाओं, राशन, पेंशन और डिजिटल सेवाओं को पहुँचाने वाले समस्त परिश्रमी पंचायत सहायक साथियों को नमन। आपका अथक श्रम ही ग्राम्य भारत की नींव है।\n\nशुभ दीपावली! 🪔`,
    2: `👑 *सम्मान व अधिकार – पंचायत सहायक यूनियन ज़िन्दाबाद!*\n\nमाँ महालक्ष्मी से प्रार्थना है कि यह दीपोत्सव समस्त पंचायत साथियों के जीवन में सम्मानजनक मानदेय, नियमितीकरण का मार्ग और स्थाई सामाजिक सुरक्षा लेकर आए।\n\n॥ हक और सम्मान की विजय हो ॥\nशुभ दीपावली! 🪔`,
    3: `🤝 *संगठन शक्ति – पंचायत सहायक यूनियन ज़िन्दाबाद!*\n\nएकता के सूत्र में बंधा पंचायत सहायक यूनियन का प्रत्येक साथी हमारा गर्व है। आइए इस दीपोत्सव पर परस्पर भ्रातृत्व, संगठन की मजबूती और सामूहिक प्रगति का पावन संकल्प लें।\n\n॥ हमारी एकता ही हमारी शक्ति है ॥\nशुभ दीपावली! 🪔`,
    4: `🪔 *आरोग्य व समृद्धि – पंचायत सहायक यूनियन ज़िन्दाबाद!*\n\nआपके और आपके समस्त परिवारजनों के उत्तम स्वास्थ्य, दीर्घायु और अपार खुशियों की मंगलकामना। दीपों का यह पर्व आपके आंगन को वैभव और आनंद के प्रकाश से भर दे।\n\nशुभ दीपावली! 🪔`
  };

  /* --------------------------------------------------------------------------
     2. AUDIO ENGINE (GFHGHF.mp3 Slicing & Auto-Play on First Gesture)
     ========================================================================== */
  const AudioEngine = {
    initContext() {
      if (!STATE.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          STATE.audioContext = new AudioCtx();
          this.loadExternalAudio();
        }
      }
      if (STATE.audioContext && STATE.audioContext.state === 'suspended') {
        STATE.audioContext.resume();
      }
    },

    loadExternalAudio() {
      if (STATE.audioBufferLoaded || !STATE.audioContext) return;

      fetch('GFHGHF.mp3')
        .then(res => res.ok ? res.arrayBuffer() : Promise.reject())
        .then(arr => STATE.audioContext.decodeAudioData(arr))
        .then(buf => {
          STATE.audioBuffer = buf;
          STATE.audioBufferLoaded = true;
        })
        .catch(() => {});
    },

    // Play random sliced segment of GFHGHF.mp3
    playAudioSlice(duration = 1.0, rate = 1.0, gainVal = 0.5) {
      if (!STATE.audioEnabled || !STATE.audioContext || !STATE.audioBuffer) return false;

      const ctx = STATE.audioContext;
      const totalDur = STATE.audioBuffer.duration;
      const maxStart = Math.max(0, totalDur - duration);
      const start = Math.random() * maxStart;

      try {
        const source = ctx.createBufferSource();
        source.buffer = STATE.audioBuffer;
        source.playbackRate.value = rate;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(ctx.currentTime, start, duration);
        return true;
      } catch (e) {
        return false;
      }
    },

    // 1. Firework Explosion Sound
    playExplosion(intensity = 1.0) {
      if (!STATE.audioEnabled) return;
      this.initContext();
      if (!STATE.audioContext) return;

      // Try playing sliced chunk of user's mp3
      this.playAudioSlice(0.7 + Math.random() * 0.6, 0.9 + Math.random() * 0.3, 0.6 * intensity);

      // Layered punchy bass thump
      const ctx = STATE.audioContext;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * intensity, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

      gain.gain.setValueAtTime(0.22 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);

      setTimeout(() => this.playCrackle(0.7), 90);
    },

    // 2. Crisp Crackle Pop
    playCrackle(vol = 1.0) {
      if (!STATE.audioEnabled || !STATE.audioContext) return;
      const ctx = STATE.audioContext;
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2600, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    },

    // 3. Rocket Whoosh
    playRocketWhoosh() {
      if (!STATE.audioEnabled) return;
      this.initContext();
      if (!STATE.audioContext) return;

      const ctx = STATE.audioContext;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    },

    // 4. Temple Bell Chime
    playBell(pitch = 587.33) {
      this.initContext();
      if (!STATE.audioContext) return;

      const ctx = STATE.audioContext;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.9);
    },

    // 5. Match Strike
    playMatchStrike() {
      this.initContext();
      if (!STATE.audioContext) return;

      const ctx = STATE.audioContext;
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    },

    // 6. Continuous Gentle Firecracker Ambience
    startAmbience() {
      if (STATE.ambientTimer) return;

      const pop = () => {
        if (!STATE.audioEnabled) return;
        this.playExplosion(0.45 + Math.random() * 0.25);
        STATE.ambientTimer = setTimeout(pop, Math.random() * 2200 + 1800);
      };

      pop();
    },

    stopAmbience() {
      if (STATE.ambientTimer) {
        clearTimeout(STATE.ambientTimer);
        STATE.ambientTimer = null;
      }
    }
  };

  /* --------------------------------------------------------------------------
     3. DYNAMIC SCREEN FLASH (Ultra-Lightweight CSS Transition)
     ========================================================================== */
  const ScreenFlash = {
    el: null,
    timer: null,

    init() {
      this.el = document.getElementById('realLightFlash');
    },

    flash() {
      if (!this.el) return;
      this.el.style.opacity = '0.38';
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.el) this.el.style.opacity = '0';
      }, 100);
    }
  };

  /* --------------------------------------------------------------------------
     4. ULTRA-OPTIMIZED 60FPS FIREWORKS (Zero-Lag on Mobile & TV)
     ========================================================================== */
  const FireworksEngine = {
    canvas: null,
    ctx: null,
    particles: [],
    rockets: [],
    sparks: [],
    embers: [],
    width: 0,
    height: 0,
    lastAuto: 0,
    autoInterval: 3200,
    lastAutoChakri: 0,
    chakriInterval: 13000,
    lastAutoAnar: 0,
    anarInterval: 15000,
    lastAutoLantern: 0,
    lanternInterval: 18000,

    colors: [
      ['#ffd166', '#ffb703', '#ffffff', '#ff9f1c'], // Royal 24K Gold & Diamond Sparkle
      ['#ff1744', '#ff5252', '#ffd166', '#ffffff'], // Crimson Ruby & Gold
      ['#00e676', '#69f0ae', '#ffd166', '#ffffff'], // Vivid Emerald & Gold
      ['#00e5ff', '#18ffff', '#ffd166', '#ffffff'], // Electric Cyan & Gold
      ['#e040fb', '#ea80fc', '#ffd166', '#ffffff']  // Purple & Gold
    ],

    init() {
      this.canvas = document.getElementById('fireworksCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Screen click launches 1 rocket directly to pointer
      window.addEventListener('pointerdown', (e) => {
        const t = e.target;
        if (t.closest('button') || t.closest('input') || t.closest('.diya-interactive-rig') || t.closest('.pro-card') || t.closest('.name-modal-card')) return;
        this.launchRocket(e.clientX, e.clientY);
        AudioEngine.playRocketWhoosh();
      });

      // Pointermove generates sparks in same canvas
      const handleMove = (x, y) => {
        if (!STATE.sparklerActive) return;
        this.addSparks(x, y, 3);
      };
      window.addEventListener('pointermove', (e) => handleMove(e.clientX, e.clientY), { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      // Light ambient embers (only 16 for maximum battery/GPU performance)
      for (let i = 0; i < 16; i++) {
        this.embers.push(this.createEmber(true));
      }

      this.loop();
    },

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    },

    createEmber(initial = false) {
      return {
        x: Math.random() * this.width,
        y: initial ? Math.random() * this.height : this.height + 10,
        radius: Math.random() * 1.5 + 0.6,
        color: Math.random() > 0.4 ? '#ffd166' : '#ff9f1c',
        alpha: Math.random() * 0.6 + 0.2,
        speedY: -(Math.random() * 0.4 + 0.2),
        speedX: (Math.random() - 0.5) * 0.2
      };
    },

    launchRocket(tx, ty) {
      const sx = tx + (Math.random() - 0.5) * 40;
      const sy = this.height;
      const angle = Math.atan2(ty - sy, tx - sx);
      const dist = Math.hypot(tx - sx, ty - sy);
      const speed = dist / 22;

      this.rockets.push({
        x: sx,
        y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        targetX: tx,
        targetY: ty,
        color: '#ffd166'
      });
    },

    explode(x, y) {
      const pal = this.colors[Math.floor(Math.random() * this.colors.length)];
      ScreenFlash.flash();
      AudioEngine.playExplosion(0.9);

      // Layer 1: Wide-Spread Shell (High Velocity & Long Hang Time)
      const outerCount = 24;
      for (let i = 0; i < outerCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4.5 + 4.5; // High velocity wide spread!
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 1.0,
          decay: Math.random() * 0.012 + 0.009,
          radius: Math.random() * 1.8 + 1.0,
          gravity: 0.05,
          color: pal[Math.floor(Math.random() * pal.length)]
        });
      }

      // Layer 2: Core Golden Sparkles
      const coreCount = 10;
      for (let i = 0; i < coreCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 2.5 + 1.0;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 1.0,
          decay: Math.random() * 0.014 + 0.01,
          radius: Math.random() * 1.6 + 0.8,
          gravity: 0.04,
          color: '#ffffff'
        });
      }

      // Hard-cap active particles to 50 max to guarantee silky 60FPS on TV & mobile
      if (this.particles.length > 50) {
        this.particles.splice(0, this.particles.length - 50);
      }
    },

    addSparks(x, y, count = 3) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3 + 1;
        this.sparks.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 1,
          decay: 0.045,
          color: Math.random() > 0.3 ? '#ffd166' : '#fff'
        });
      }
      if (this.sparks.length > 30) {
        this.sparks.splice(0, this.sparks.length - 30);
      }
    },

    spawnChakri(x, y) {
      STATE.chakris.push({ x, y, angle: 0, duration: 75 });
    },

    spawnAnar(x, y) {
      STATE.anars.push({ x, y, duration: 80 });
    },

    loop(time = 0) {
      requestAnimationFrame((t) => this.loop(t));

      // Fast clear with slight trailing
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = 'lighter';

      // Auto firework rocket launch
      if (time - this.lastAuto > this.autoInterval) {
        const tx = Math.random() * (this.width * 0.8) + this.width * 0.1;
        const ty = Math.random() * (this.height * 0.35) + 60;
        this.launchRocket(tx, ty);
        this.lastAuto = time;
        this.autoInterval = Math.random() * 1400 + 3000;
      }

      // Auto Ground Chakri
      if (time - this.lastAutoChakri > this.chakriInterval) {
        const cx = Math.random() > 0.5 
          ? (Math.random() * (this.width * 0.22) + 30)
          : (this.width - Math.random() * (this.width * 0.22) - 30);
        const cy = this.height - Math.random() * 50 - 45;
        this.spawnChakri(cx, cy);
        this.lastAutoChakri = time;
        this.chakriInterval = Math.random() * 4000 + 11000;
      }

      // Auto Anar
      if (time - this.lastAutoAnar > this.anarInterval) {
        const ax = Math.random() * (this.width * 0.6) + this.width * 0.2;
        const ay = this.height - 25;
        this.spawnAnar(ax, ay);
        this.lastAutoAnar = time;
        this.anarInterval = Math.random() * 5000 + 13000;
      }

      // Auto Sky Lantern
      if (time - this.lastAutoLantern > this.lanternInterval) {
        if (typeof InteractionManager !== 'undefined' && InteractionManager.releaseSkyLantern) {
          if (document.querySelectorAll('.sky-lantern-float').length < 2) {
            InteractionManager.releaseSkyLantern();
          }
        }
        this.lastAutoLantern = time;
        this.lanternInterval = Math.random() * 6000 + 16000;
      }

      // 1. Update Rockets
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i];
        r.x += r.vx;
        r.y += r.vy;

        this.ctx.fillStyle = r.color;
        this.ctx.fillRect(r.x - 1.5, r.y - 1.5, 3, 3);

        if (r.y <= r.targetY || Math.hypot(r.x - r.targetX, r.y - r.targetY) < 18) {
          this.explode(r.targetX, r.targetY);
          this.rockets.splice(i, 1);
        }
      }

      // 2. Update Explosion Particles (Ultra-Fast fillRect, zero GPU stall)
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }

      // 3. Update Sparkler Trail
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.x += s.vx;
        s.y += s.vy + 0.12;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          this.sparks.splice(i, 1);
          continue;
        }

        this.ctx.globalAlpha = s.alpha;
        this.ctx.fillStyle = s.color;
        this.ctx.fillRect(s.x - 1, s.y - 1, 2.2, 2.2);
      }

      // 4. Update Active Chakris
      for (let i = STATE.chakris.length - 1; i >= 0; i--) {
        const ch = STATE.chakris[i];
        ch.angle += 0.45;
        ch.duration--;

        for (let a = 0; a < 3; a++) {
          const ang = ch.angle + (a * Math.PI * 2 / 3);
          const spd = Math.random() * 3.5 + 1.5;
          this.particles.push({
            x: ch.x + Math.cos(ang) * 25,
            y: ch.y + Math.sin(ang) * 25,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            alpha: 1,
            decay: 0.05,
            radius: 1.5,
            gravity: 0.04,
            color: '#ffd166'
          });
        }
        if (ch.duration <= 0) {
          this.explode(ch.x, ch.y);
          STATE.chakris.splice(i, 1);
        }
      }

      // 5. Update Active Anars
      for (let i = STATE.anars.length - 1; i >= 0; i--) {
        const an = STATE.anars[i];
        an.duration--;

        for (let s = 0; s < 4; s++) {
          const cone = -Math.PI / 2 + (Math.random() - 0.5) * 0.45;
          const spd = Math.random() * 7 + 4;
          this.particles.push({
            x: an.x + (Math.random() - 0.5) * 8,
            y: an.y,
            vx: Math.cos(cone) * spd,
            vy: Math.sin(cone) * spd,
            alpha: 1,
            decay: 0.026,
            radius: 1.8,
            gravity: 0.16,
            color: '#ffd166'
          });
        }
        if (an.duration <= 0) STATE.anars.splice(i, 1);
      }

      // 6. Update Embers
      for (let i = 0; i < this.embers.length; i++) {
        const emb = this.embers[i];
        emb.x += emb.speedX;
        emb.y += emb.speedY;

        if (emb.y < -10 || emb.x < -10 || emb.x > this.width + 10) {
          this.embers[i] = this.createEmber(false);
          continue;
        }

        this.ctx.globalAlpha = emb.alpha;
        this.ctx.fillStyle = emb.color;
        this.ctx.beginPath();
        this.ctx.arc(emb.x, emb.y, emb.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.globalAlpha = 1.0;
    }
  };

  /* --------------------------------------------------------------------------
     5. MAIN INTERACTION CONTROLLER (Diya, Festive Emoji Dock, Sharing)
     ========================================================================== */
  const InteractionManager = {
    init() {
      this.bindDiyaClick();
      this.generateToran();
      this.generateRangoliPetals();
      this.bindSharingActions();
      this.bindPersonalNameCard();
      this.bindSoundToggle();
      this.bindAutoSoundOnFirstGesture();
    },

    // Browser Autoplay: Starts sound automatically on first touch, scroll, or click
    bindAutoSoundOnFirstGesture() {
      const unlockAudio = () => {
        AudioEngine.initContext();
        if (STATE.audioEnabled) {
          AudioEngine.startAmbience();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('scroll', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('scroll', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
    },

    bindDiyaClick() {
      const diyaRig = document.getElementById('mainDiyaRig');
      const flame = document.getElementById('flameComplex');
      const spark = document.getElementById('sparkIgnition');
      const statusText = document.getElementById('diyaStatusText');

      if (!diyaRig) return;

      diyaRig.addEventListener('click', () => {
        STATE.isDiyaLit = !STATE.isDiyaLit;

        if (spark) {
          spark.classList.remove('strike');
          void spark.offsetWidth;
          spark.classList.add('strike');
        }

        if (STATE.isDiyaLit) {
          diyaRig.classList.add('lit');
          if (flame) flame.classList.add('lit');

          AudioEngine.playMatchStrike();
          setTimeout(() => AudioEngine.playBell(587.33), 120);
          ScreenFlash.flash();

          if (statusText) statusText.textContent = 'दीप प्रज्वलित है • सुख-समृद्धि आपके द्वार हो';

          const rect = diyaRig.getBoundingClientRect();
          FireworksEngine.explode(rect.left + rect.width / 2, rect.top);

          showToast('🪔 शुभ दीप प्रज्वलित! पंचायत सहायक यूनियन ज़िन्दाबाद!');
        } else {
          diyaRig.classList.remove('lit');
          if (flame) flame.classList.remove('lit');
          if (statusText) statusText.textContent = 'दीप प्रज्वलित करने के लिए स्पर्श करें 🪔';
          showToast('दीप बुझाया गया। पुनः प्रज्वलित करने के लिए स्पर्श करें।');
        }
      });
    },

    bindSharingActions() {
      const btnWa = document.getElementById('btnMasterWhatsApp');
      if (btnWa) {
        btnWa.addEventListener('click', () => {
          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(DEDICATION_WISH + '\n\n🌐 https://psuhappydiwali.netlify.app/')}`;
          window.open(url, '_blank');
        });
      }

      const btnCopy = document.getElementById('btnMasterCopy');
      if (btnCopy) {
        btnCopy.addEventListener('click', () => {
          copyText(DEDICATION_WISH + '\n\n🌐 https://psuhappydiwali.netlify.app/', '✨ पंचायत सहायक यूनियन संदेश कॉपी हो गया!');
          AudioEngine.playBell(659.25);
        });
      }

      document.querySelectorAll('.btn-sub-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (CARD_MESSAGES[id]) {
            copyText(CARD_MESSAGES[id] + '\n\n🌐 https://psuhappydiwali.netlify.app/', '📋 कार्ड संदेश कॉपी हो गया!');
            AudioEngine.playBell(587.33);
          }
        });
      });

      document.querySelectorAll('.btn-sub-wa').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (CARD_MESSAGES[id]) {
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(CARD_MESSAGES[id] + '\n\n🌐 https://psuhappydiwali.netlify.app/')}`;
            window.open(url, '_blank');
          }
        });
      });
    },

    /* ------------------------------------------------------------------------
       FESTIVE POSTER GENERATOR & DOWNLOAD/SHARE CONTROLLER
       ------------------------------------------------------------------------ */
    bindPersonalNameCard() {
      const nameInput = document.getElementById('senderNameInput');
      const btnOpen = document.getElementById('btnOpenNameModal');
      const modal = document.getElementById('nameShareModal');
      const btnClose = document.getElementById('btnCloseNameModal');
      const posterSpinner = document.getElementById('posterSpinner');
      const posterImgTag = document.getElementById('posterImgTag');
      const btnDownload = document.getElementById('btnDownloadPoster');
      const btnWa = document.getElementById('btnModalWhatsApp');
      const btnCopy = document.getElementById('btnModalCopy');

      let currentPosterDataUrl = null;
      let currentSenderName = '';

      const openModal = () => {
        const rawName = nameInput ? nameInput.value.trim() : '';
        currentSenderName = rawName || 'समस्त पंचायत साथी';

        if (modal) {
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          AudioEngine.playBell(659.25);
        }

        // Show loading spinner while rendering high-res canvas
        if (posterSpinner) posterSpinner.style.display = 'flex';
        if (posterImgTag) {
          posterImgTag.style.display = 'none';
          posterImgTag.removeAttribute('src');
        }

        // Generate poster on next frame so modal renders immediately
        setTimeout(() => {
          try {
            currentPosterDataUrl = generateDiwaliPoster(currentSenderName);
            if (posterImgTag && currentPosterDataUrl) {
              posterImgTag.src = currentPosterDataUrl;
              posterImgTag.style.display = 'block';
            }
            if (posterSpinner) posterSpinner.style.display = 'none';
          } catch (err) {
            console.error('Poster generation error:', err);
            if (posterSpinner) {
              posterSpinner.innerHTML = '<span>⚠️ पोस्टर बनाने में असमर्थ। पुनः प्रयास करें।</span>';
            }
          }
        }, 60);
      };

      const closeModal = () => {
        if (modal) {
          modal.classList.remove('open');
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      };

      if (btnOpen) btnOpen.addEventListener('click', openModal);

      if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') openModal();
        });
      }

      if (btnClose) btnClose.addEventListener('click', closeModal);

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
          closeModal();
        }
      });

      // 1. Download PNG Poster Button
      if (btnDownload) {
        btnDownload.addEventListener('click', () => {
          if (!currentPosterDataUrl) return;
          downloadPoster(currentPosterDataUrl, currentSenderName);
          AudioEngine.playBell(587.33);
        });
      }

      // 2. WhatsApp Share Button (Native File Share on Mobile / Fallback download + WA Web)
      if (btnWa) {
        btnWa.addEventListener('click', () => {
          if (!currentPosterDataUrl) return;
          sharePoster(currentPosterDataUrl, currentSenderName);
        });
      }

      // 3. Copy Text & Website Link
      if (btnCopy) {
        btnCopy.addEventListener('click', () => {
          const shareText = `🪔 *शुभ दीपावली – पंचायत सहायक यूनियन ज़िन्दाबाद!* ✨\n\n` +
            `समस्त पंचायत सहायक साथियों को दीपोत्सव की हार्दिक शुभकामनाएं!\n\n` +
            `गाँव के अंतिम व्यक्ति तक जनसेवा, ईमानदारी और विकास की पावन ज्योति प्रज्वलित करने वाले समस्त कर्मयोगी पंचायत सहायकों को कोटि-कोटि नमन।\n\n` +
            `✦ *हमारा संघर्ष • हमारी एकता • हमारा स्वाभिमान* ✦\n` +
            `॥ पंचायत सहायक यूनियन ज़िन्दाबाद ॥\n\n` +
            `सप्रेम शुभकामना प्रेषक:\n` +
            `*✨ ${currentSenderName} (पंचायत साथी) ✨*\n\n` +
            `🌐 व्यक्तिगत बधाई पोस्टर देखें व बनाएं:\n` +
            `https://psuhappydiwali.netlify.app/\n\n` +
            `— Made with ❤️ by Vaibhav Yadav`;

          copyText(shareText, '📋 पोस्टर शुभकामना संदेश व लिंक कॉपी हो गया!');
          AudioEngine.playBell(587.33);
        });
      }
    },

    bindSoundToggle() {
      const btn = document.getElementById('soundToggleBtn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        AudioEngine.initContext();
        STATE.audioEnabled = !STATE.audioEnabled;

        if (STATE.audioEnabled) {
          AudioEngine.startAmbience();
          btn.classList.add('playing');
          showToast('🔊 उत्सव ध्वनि चालू!');
        } else {
          AudioEngine.stopAmbience();
          btn.classList.remove('playing');
          showToast('🔇 ध्वनि म्यूट की गई।');
        }
      });
    },

    generateToran() {
      const row = document.getElementById('toranRow');
      if (!row) return;

      let html = '';
      const count = 16;
      for (let i = 0; i < count; i++) {
        html += `
          <div class="toran-node">
            <svg class="toran-leaf-svg" viewBox="0 0 16 32">
              <path d="M8,0 C2,10 0,22 8,32 C16,22 14,10 8,0 Z"/>
            </svg>
            <div class="toran-genda-flower"></div>
          </div>
        `;
      }
      row.innerHTML = html;
    },

    generateRangoliPetals() {
      const g = document.getElementById('rangoliPetals16');
      if (!g) return;

      let html = '';
      const cx = 200, cy = 200, petals = 16;
      const step = (Math.PI * 2) / petals;

      for (let i = 0; i < petals; i++) {
        const deg = (i * step * 180) / Math.PI;
        html += `
          <g transform="rotate(${deg} ${cx} ${cy})">
            <path d="M${cx},${cy - 100} Q${cx - 24},${cy - 135} ${cx},${cy - 160} Q${cx + 24},${cy - 135} ${cx},${cy - 100}" 
                  stroke="#ffd166" stroke-width="1.4" fill="rgba(255,183,3,0.06)"/>
            <circle cx="${cx}" cy="${cy - 156}" r="2.5" fill="#ffd166"/>
          </g>
        `;
      }
      g.innerHTML = html;
    }
  };

  /* --------------------------------------------------------------------------
     6. UTILITY & POSTER RENDERING FUNCTIONS
     ========================================================================== */
  function drawRoundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function generateDiwaliPoster(rawName) {
    const cleanName = (rawName || '').trim() || 'समस्त पंचायत साथी';
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1350);
    bgGrad.addColorStop(0, '#040714');
    bgGrad.addColorStop(0.28, '#0b1638');
    bgGrad.addColorStop(0.65, '#170924');
    bgGrad.addColorStop(1, '#03050c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. Central Warm Ambient Glow Behind Diya
    const radialGlow = ctx.createRadialGradient(540, 580, 50, 540, 580, 520);
    radialGlow.addColorStop(0, 'rgba(255, 183, 3, 0.28)');
    radialGlow.addColorStop(0.45, 'rgba(230, 81, 0, 0.16)');
    radialGlow.addColorStop(0.8, 'rgba(185, 28, 28, 0.08)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, 1080, 1350);

    // 3. Sacred Mandala Background Watermark
    ctx.save();
    ctx.translate(540, 580);
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.045)';
    ctx.lineWidth = 1.6;
    for (let r = 80; r <= 360; r += 70) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const petals = 24;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const ex = Math.cos(angle) * 380;
      const ey = Math.sin(angle) * 380;
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Royal 24K Gold Filigree Borders & Corners
    const goldGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.25, '#d4af37');
    goldGrad.addColorStop(0.5, '#fff4b8');
    goldGrad.addColorStop(0.75, '#b48a20');
    goldGrad.addColorStop(1, '#fef08a');

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 5;
    ctx.strokeRect(38, 38, 1004, 1274);

    // Inner Delicate Border
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(52, 52, 976, 1246);

    // Ornate Corner Brackets & Lotus Accents
    const corners = [
      [52, 52, 1, 1],
      [1028, 52, -1, 1],
      [52, 1298, 1, -1],
      [1028, 1298, -1, -1]
    ];
    corners.forEach(([cx, cy, sx, sy]) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sx, sy);
      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(36, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(20, 20, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.fill();

      ctx.restore();
    });

    // Top Toran Beads
    for (let bx = 90; bx <= 990; bx += 45) {
      ctx.beginPath();
      ctx.arc(bx, 52, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = (bx % 90 === 0) ? '#ff5722' : '#ffc107';
      ctx.fill();
    }

    // 5. Sacred Auspicious Shloka / Mantra (Top)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.font = '700 22px "Rozha One", serif';
    ctx.fillText('𑁍 ॥ ॐ श्री गणेशाय नमः • श्री महालक्ष्म्यै नमः ॥ 𑁍', 540, 110);

    // 6. Grand Festival Heading: "शुभ दीपावली"
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    const titleGrad = ctx.createLinearGradient(200, 140, 880, 230);
    titleGrad.addColorStop(0, '#fffbeb');
    titleGrad.addColorStop(0.3, '#fde047');
    titleGrad.addColorStop(0.65, '#f59e0b');
    titleGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = titleGrad;
    ctx.font = 'bold 92px "Rozha One", serif';
    ctx.fillText('शुभ दीपावली', 540, 215);
    ctx.restore();

    // Subtitle
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('प्रकाश, सौहार्द और खुशियों का पावन महापर्व', 540, 260);

    // 7. Royal Union Zindabad Ribbon Plaque
    const ribbonW = 760;
    const ribbonH = 56;
    const ribbonX = 540 - ribbonW / 2;
    const ribbonY = 285;

    ctx.save();
    ctx.shadowColor = 'rgba(225, 29, 72, 0.45)';
    ctx.shadowBlur = 15;
    const ribGrad = ctx.createLinearGradient(ribbonX, ribbonY, ribbonX + ribbonW, ribbonY);
    ribGrad.addColorStop(0, '#991b1b');
    ribGrad.addColorStop(0.5, '#e11d48');
    ribGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = ribGrad;
    drawRoundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 28);
    ctx.fill();

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    drawRoundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 28);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 29px "Rozha One", serif';
    ctx.fillText('॥ पंचायत सहायक यूनियन ज़िन्दाबाद ॥', 540, ribbonY + 39);

    // 8. Salutation Headline
    ctx.fillStyle = '#fde047';
    ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('समस्त पंचायत सहायक साथियों को दीपोत्सव की हार्दिक शुभकामनाएं', 540, 385);

    // 9. Central Photorealistic Glowing Diya
    const diyaCX = 540;
    const diyaCY = 585;

    // Glowing Flame Aura
    const flameAura = ctx.createRadialGradient(diyaCX, diyaCY - 50, 10, diyaCX, diyaCY - 50, 160);
    flameAura.addColorStop(0, 'rgba(255, 220, 100, 0.85)');
    flameAura.addColorStop(0.35, 'rgba(255, 107, 0, 0.45)');
    flameAura.addColorStop(0.7, 'rgba(220, 38, 38, 0.15)');
    flameAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flameAura;
    ctx.beginPath();
    ctx.arc(diyaCX, diyaCY - 50, 160, 0, Math.PI * 2);
    ctx.fill();

    // Floating Sparks
    for (let i = 0; i < 18; i++) {
      const spAng = Math.random() * Math.PI * 2;
      const spDist = Math.random() * 110 + 20;
      ctx.fillStyle = Math.random() > 0.4 ? '#fffae0' : '#ffd166';
      ctx.beginPath();
      ctx.arc(diyaCX + Math.cos(spAng) * spDist, (diyaCY - 50) + Math.sin(spAng) * spDist * 0.75, Math.random() * 2.8 + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Flame Teardrop (Outer Orange)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(diyaCX, diyaCY - 135);
    ctx.bezierCurveTo(diyaCX + 38, diyaCY - 80, diyaCX + 42, diyaCY - 20, diyaCX, diyaCY - 15);
    ctx.bezierCurveTo(diyaCX - 42, diyaCY - 20, diyaCX - 38, diyaCY - 80, diyaCX, diyaCY - 135);
    ctx.closePath();
    const flGrad = ctx.createLinearGradient(diyaCX, diyaCY - 135, diyaCX, diyaCY - 15);
    flGrad.addColorStop(0, '#ffffff');
    flGrad.addColorStop(0.2, '#fff176');
    flGrad.addColorStop(0.55, '#ff9800');
    flGrad.addColorStop(1, '#e65100');
    ctx.fillStyle = flGrad;
    ctx.shadowColor = 'rgba(255, 152, 0, 0.95)';
    ctx.shadowBlur = 30;
    ctx.fill();

    // Flame Core (White & Yellow)
    ctx.beginPath();
    ctx.moveTo(diyaCX, diyaCY - 110);
    ctx.bezierCurveTo(diyaCX + 18, diyaCY - 70, diyaCX + 20, diyaCY - 24, diyaCX, diyaCY - 20);
    ctx.bezierCurveTo(diyaCX - 20, diyaCY - 24, diyaCX - 18, diyaCY - 70, diyaCX, diyaCY - 110);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Wick (Baati)
    ctx.beginPath();
    ctx.moveTo(diyaCX, diyaCY - 20);
    ctx.lineTo(diyaCX, diyaCY + 10);
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Brass Diya Base Shadow
    ctx.beginPath();
    ctx.ellipse(diyaCX, diyaCY + 85, 150, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();

    // Sculpted Brass Diya Bowl
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(diyaCX - 170, diyaCY + 15);
    ctx.bezierCurveTo(diyaCX - 150, diyaCY + 95, diyaCX - 50, diyaCY + 95, diyaCX, diyaCY + 95);
    ctx.bezierCurveTo(diyaCX + 50, diyaCY + 95, diyaCX + 150, diyaCY + 95, diyaCX + 170, diyaCY + 15);
    ctx.bezierCurveTo(diyaCX + 100, diyaCY + 30, diyaCX - 100, diyaCY + 30, diyaCX - 170, diyaCY + 15);
    ctx.closePath();

    const brassGrad = ctx.createLinearGradient(diyaCX - 170, diyaCY, diyaCX + 170, diyaCY);
    brassGrad.addColorStop(0, '#5a2e05');
    brassGrad.addColorStop(0.2, '#d97706');
    brassGrad.addColorStop(0.5, '#fef08a');
    brassGrad.addColorStop(0.8, '#d97706');
    brassGrad.addColorStop(1, '#5a2e05');
    ctx.fillStyle = brassGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 16;
    ctx.fill();

    // Diya Rim Oval Lip
    ctx.beginPath();
    ctx.ellipse(diyaCX, diyaCY + 15, 172, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Sacred Ghee Oil Pool
    ctx.beginPath();
    ctx.ellipse(diyaCX, diyaCY + 18, 150, 19, 0, 0, Math.PI * 2);
    const oilGrad = ctx.createRadialGradient(diyaCX, diyaCY + 16, 10, diyaCX, diyaCY + 18, 150);
    oilGrad.addColorStop(0, '#fef08a');
    oilGrad.addColorStop(0.4, '#f59e0b');
    oilGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = oilGrad;
    ctx.fill();

    // Engraved Filigree on Diya Body
    ctx.beginPath();
    ctx.arc(diyaCX, diyaCY + 65, 5, 0, Math.PI * 2);
    ctx.arc(diyaCX - 60, diyaCY + 58, 4, 0, Math.PI * 2);
    ctx.arc(diyaCX + 60, diyaCY + 58, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fffbeb';
    ctx.fill();
    ctx.restore();

    // 10. Heartfelt Union Dedication Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('गाँव के अंतिम व्यक्ति तक जनसेवा, ईमानदारी और विकास की पावन ज्योति', 540, 755);
    ctx.fillText('प्रज्वलित करने वाले समस्त कर्मयोगी पंचायत सहायकों को कोटि-कोटि नमन।', 540, 792);

    ctx.fillStyle = '#fde68a';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('यह दीपोत्सव आपके जीवन में सुख, सम्मान, सुरक्षा और नियमितीकरण', 540, 842);
    ctx.fillText('के ऐतिहासिक लक्ष्य की विजय लेकर आए।', 540, 874);

    // Slogan Line
    ctx.fillStyle = '#ffd166';
    ctx.font = 'italic 700 25px "Rozha One", serif';
    ctx.fillText('✦ हमारा संघर्ष • हमारी एकता • हमारा स्वाभिमान ✦', 540, 932);

    // 11. PERSONALIZED SENDER CARTOUCHE / PLAQUE (User's Name!)
    const plaqueW = 860;
    const plaqueH = 150;
    const plaqueX = 540 - plaqueW / 2;
    const plaqueY = 970;

    ctx.save();
    // Plaque background
    const plqGrad = ctx.createLinearGradient(plaqueX, plaqueY, plaqueX + plaqueW, plaqueY + plaqueH);
    plqGrad.addColorStop(0, 'rgba(12, 18, 40, 0.98)');
    plqGrad.addColorStop(0.5, 'rgba(28, 20, 50, 0.98)');
    plqGrad.addColorStop(1, 'rgba(12, 18, 40, 0.98)');
    ctx.fillStyle = plqGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 20;
    drawRoundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 20);
    ctx.fill();

    // Plaque Double Border
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 20);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
    ctx.lineWidth = 1;
    drawRoundRect(ctx, plaqueX + 6, plaqueY + 6, plaqueW - 12, plaqueH - 12, 16);
    ctx.stroke();
    ctx.restore();

    // Plaque Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✨ सप्रेम शुभकामना प्रेषक ✨', 540, plaqueY + 36);

    // User's Name in Magnificent Hindi Calligraphy
    ctx.save();
    ctx.shadowColor = 'rgba(74, 222, 128, 0.55)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 44px "Rozha One", serif';
    ctx.fillText(`${cleanName} (पंचायत साथी)`, 540, plaqueY + 90);
    ctx.restore();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ग्राम पंचायत परिवार • पंचायत सहायक यूनियन', 540, plaqueY + 126);

    // 12. Official Website Link Pill
    const linkPillW = 680;
    const linkPillH = 46;
    const linkPillX = 540 - linkPillW / 2;
    const linkPillY = 1146;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    drawRoundRect(ctx, linkPillX, linkPillY, linkPillW, linkPillH, 23);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.4;
    drawRoundRect(ctx, linkPillX, linkPillY, linkPillW, linkPillH, 23);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🌐 शुभकामना वेबसाइट: https://psuhappydiwali.netlify.app/', 540, linkPillY + 30);

    // 13. Footer Dedication & Vaibhav Yadav Credit
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('सत्य, सेवा, समर्पण और एकता का पावन पर्व • Made with ❤️ by Vaibhav Yadav', 540, 1230);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'italic 18px "Rozha One", serif';
    ctx.fillText('॥ ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥', 540, 1262);

    return canvas.toDataURL('image/png');
  }

  function downloadPoster(posterDataUrl, name) {
    const cleanName = (name || '').trim() || 'Panchayat-Sahayak';
    const safeName = cleanName.replace(/[^a-zA-Z0-9\u0900-\u097F_-]/g, '_');
    const a = document.createElement('a');
    a.download = `Diwali-Poster-${safeName}.png`;
    a.href = posterDataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥 बधाई पोस्टर सफलतापूर्वक डाउनलोड हो गया!');
  }

  async function sharePoster(posterDataUrl, name) {
    const cleanName = (name || '').trim() || 'पंचायत साथी';
    const shareText = `🪔 *शुभ दीपावली – पंचायत सहायक यूनियन ज़िन्दाबाद!* ✨\n\n` +
      `समस्त पंचायत सहायक साथियों को दीपोत्सव की हार्दिक शुभकामनाएं!\n\n` +
      `गाँव के अंतिम व्यक्ति तक विकास व जनसेवा की लौ जलाने वाले समस्त कर्मयोगी पंचायत सहायकों को नमन।\n\n` +
      `✦ *हमारा संघर्ष • हमारी एकता • हमारा स्वाभिमान* ✦\n` +
      `॥ पंचायत सहायक यूनियन ज़िन्दाबाद ॥\n\n` +
      `सप्रेम शुभकामना प्रेषक:\n` +
      `*✨ ${cleanName} (पंचायत साथी) ✨*\n\n` +
      `🌐 अपना व्यक्तिगत बधाई पोस्टर बनाएं व देखें:\n` +
      `https://psuhappydiwali.netlify.app/\n\n` +
      `— Made with ❤️ by Vaibhav Yadav`;

    try {
      if (navigator.share && window.isSecureContext) {
        const res = await fetch(posterDataUrl);
        const blob = await res.blob();
        const file = new File([blob], `Diwali-Poster-${cleanName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'शुभ दीपावली – पंचायत सहायक यूनियन',
            text: shareText
          });
          showToast('✅ WhatsApp / शेयर विंडो खुल गई!');
          return;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
    }

    // Fallback: Download file automatically & launch WhatsApp
    downloadPoster(posterDataUrl, cleanName);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
    showToast('📥 पोस्टर डाउनलोड हो गया! WhatsApp पर शेयर करें!');
  }
  function copyText(text, successMsg = 'कॉपी हो गया!') {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('⚠️ कॉपी करने में असमर्थ');
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>✨</span> <span>${escapeHTML(msg)}</span>`;
    container.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c] || c));
  }

  /* --------------------------------------------------------------------------
     7. INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    ScreenFlash.init();
    FireworksEngine.init();
    InteractionManager.init();
  });

})();
