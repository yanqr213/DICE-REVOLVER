
// Advanced Procedural Audio Engine
// Style: Balatro-inspired / Groovy Synthwave
// Logic: Pattern-based sequencer with continuous drone layers

export type BGMMode = 'NORMAL' | 'BOSS';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  // Sequencer State
  private isPlaying: boolean = false;
  private currentMode: BGMMode = 'NORMAL';
  private tempo: number = 110;
  private lookahead: number = 25.0;
  private scheduleAheadTime: number = 0.1;
  private nextNoteTime: number = 0.0;
  private current16thNote: number = 0;
  private timerID: number | null = null;
  private barCount: number = 0;

  // Music Patterns (Balatro-style Funk Groove in C Minor)
  // 1 = Trigger, 0 = Rest
  private bassPattern = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]; 
  
  // Melody notes relative to Root (C Minor Pentatonic/Dorian)
  // null = rest/sustain
  private melodyPatternNormal = [
      0, null, null, 3, null, 5, null, null, 
      7, null, 5, null, 3, null, 0, null,
      -2, null, null, 0, null, null, 3, null,
      5, null, null, 3, null, 0, null, -2
  ];

  private melodyPatternBoss = [
      0, 0, 3, 0, 7, 7, 3, 0,
      10, 10, 7, 7, 12, 12, 10, 7,
      0, 0, 3, 3, 7, 7, 3, 3, 
      0, 0, 12, 12, 0, 0, 10, 10
  ];

  constructor() {}

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master Chain: Compressor -> Master Gain -> Destination
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -12;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4; 

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startBgm(mode: BGMMode = 'NORMAL') {
    this.init();
    if (this.isPlaying) {
        this.setBgmMode(mode);
        return;
    }

    this.isPlaying = true;
    this.currentMode = mode;
    this.tempo = mode === 'BOSS' ? 135 : 110;
    if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.current16thNote = 0;
        this.scheduler();
    }
  }

  public setBgmMode(mode: BGMMode) {
      this.currentMode = mode;
      this.tempo = mode === 'BOSS' ? 135 : 110;
  }

  public stopBgm() {
    this.isPlaying = false;
    if (this.timerID !== null) {
        window.clearTimeout(this.timerID);
        this.timerID = null;
    }
  }

  private scheduler() {
      if (!this.ctx) return;
      while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
          this.scheduleNote(this.current16thNote, this.nextNoteTime);
          this.nextNote();
      }
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextNote() {
      const secondsPerBeat = 60.0 / this.tempo;
      this.nextNoteTime += 0.25 * secondsPerBeat;
      this.current16thNote++;
      if (this.current16thNote === 32) { // 2 Bar loop
          this.current16thNote = 0;
          this.barCount++;
      }
  }

  private scheduleNote(step: number, time: number) {
      if (!this.ctx || !this.compressor) return;

      const isBoss = this.currentMode === 'BOSS';
      
      // --- 1. ATMOSPHERE PAD (Continuous Layer) ---
      // Trigger only at start of bars (0 and 16) to create continuity
      if (step === 0 || step === 16) {
          const root = step === 0 ? 48 : (isBoss ? 51 : 46); // C3 -> Eb3/Bb2
          this.playPad(time, root, 60.0 / this.tempo * 4 * 0.95); // Hold for almost a whole bar
      }

      // --- 2. RHYTHM SECTION (Accompaniment) ---
      // Kick - Four on the floor + syncopation
      if (step % 4 === 0 || (isBoss && step % 8 === 7)) {
          this.playKick(time, step % 4 === 0 ? 1.0 : 0.6);
      }
      // Snare - Standard backbeat
      if (step % 8 === 4) {
          this.playSnare(time);
      }
      // HiHat - 16th notes
      if (step % 2 === 0) {
           this.playHiHat(time, step % 4 === 0 ? 0.15 : 0.05);
      }

      // Bass - Locked to pattern
      // Use step modulo 16 to loop 1 bar pattern across 2 bars
      if (this.bassPattern[step % 16] === 1) {
          const bassRoot = isBoss ? 39 : 36; // Eb2 or C2
          this.playBass(time, this.mtof(bassRoot));
      }

      // --- 3. MELODY (Lead) ---
      const pattern = isBoss ? this.melodyPatternBoss : this.melodyPatternNormal;
      const noteVal = pattern[step];
      
      if (noteVal !== null && noteVal !== undefined) {
          const root = 60; // C4
          // Legato feel: length is slightly longer than a 16th note
          this.playLead(time, this.mtof(root + noteVal), isBoss);
      }
  }

  // --- SYNTHESIS ---

  private mtof(note: number): number {
      return 440 * Math.pow(2, (note - 69) / 12);
  }

  private playPad(time: number, note: number, duration: number) {
      if (!this.ctx || !this.compressor) return;
      
      // Warm Pad: 2 oscillators slightly detuned
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      
      const freq = this.mtof(note);
      osc1.frequency.value = freq;
      osc2.frequency.value = freq * 1.01; // Detune

      filter.type = 'lowpass';
      filter.frequency.value = 400;
      
      // Slow attack/release for "Continuous" feel
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + duration * 0.5);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain).connect(this.compressor);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration + 0.1);
      osc2.stop(time + duration + 0.1);
  }

  private playBass(time: number, freq: number) {
      if (!this.ctx || !this.compressor) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, time);
      filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(filter).connect(gain).connect(this.compressor);
      osc.start(time);
      osc.stop(time + 0.25);
  }

  private playLead(time: number, freq: number, isBoss: boolean) {
      if (!this.ctx || !this.compressor) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Smooth Lead
      // CHANGED: Boss now uses Sawtooth instead of Square to be less "noisy"
      osc.type = isBoss ? 'sawtooth' : 'sine'; 
      osc.frequency.setValueAtTime(freq, time);
      
      // Slight slide (portamento) for continuity
      osc.frequency.linearRampToValueAtTime(freq, time + 0.05);

      const duration = 0.2; // Longer than 16th note to connect notes
      
      // Reduced volume for Boss lead to prevent harshness
      const maxVol = isBoss ? 0.1 : 0.15;
      
      gain.gain.setValueAtTime(maxVol, time);
      gain.gain.linearRampToValueAtTime(maxVol * 0.7, time + 0.1);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      if (isBoss) {
          // Filter the sawtooth to remove harsh high end
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, time);
          filter.frequency.linearRampToValueAtTime(2000, time + 0.1); // "Wah" effect
          osc.connect(filter).connect(gain).connect(this.compressor);
      } else {
          osc.connect(gain).connect(this.compressor);
      }

      osc.start(time);
      osc.stop(time + duration);
  }

  private playKick(time: number, vol: number) {
      if (!this.ctx || !this.compressor) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
      
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      osc.connect(gain);
      gain.connect(this.compressor);
      
      osc.start(time);
      osc.stop(time + 0.2);
  }

  private playSnare(time: number) {
      if (!this.ctx || !this.compressor) return;
      const noise = this.ctx.createBufferSource();
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 800;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      noise.connect(filter).connect(gain).connect(this.compressor);
      noise.start(time);
  }

  private playHiHat(time: number, vol: number) {
      if (!this.ctx || !this.compressor) return;
      const noise = this.ctx.createBufferSource();
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      noise.connect(filter).connect(gain).connect(this.compressor);
      noise.start(time);
  }

  // --- SFX (Unchanged Logic, just integrated) ---
  public playWeaponSfx(type: 'KINETIC' | 'ENERGY' | 'EXPLOSIVE' | 'MELEE', damage: number = 50) {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const intensity = Math.min(1.5, Math.max(0.5, Math.log10(damage + 10) / 2));
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      if (intensity > 0.8) {
         const buf = this.ctx.createBuffer(1, 4000, this.ctx.sampleRate);
         const d = buf.getChannelData(0);
         for(let i=0; i<4000; i++) d[i] = Math.random()*2-1;
         const src = this.ctx.createBufferSource();
         src.buffer = buf;
         const nGain = this.ctx.createGain();
         nGain.gain.value = 0.3 * intensity;
         nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
         src.connect(nGain).connect(this.masterGain);
         src.start(t);
      }

      switch (type) {
          case 'ENERGY': 
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(880 * intensity, t);
              osc.frequency.exponentialRampToValueAtTime(110, t + 0.3 * intensity);
              gain.gain.setValueAtTime(0.3 * intensity, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3 * intensity);
              break;
          case 'EXPLOSIVE':
              osc.type = 'square';
              osc.frequency.setValueAtTime(150 * intensity, t);
              osc.frequency.exponentialRampToValueAtTime(20, t + 0.5 * intensity);
              gain.gain.setValueAtTime(0.5 * intensity, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 * intensity);
              break;
          case 'MELEE':
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(800, t);
              osc.frequency.linearRampToValueAtTime(100, t + 0.1);
              gain.gain.setValueAtTime(0.2 * intensity, t);
              gain.gain.linearRampToValueAtTime(0.001, t + 0.1);
              break;
          default: 
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(200 * intensity, t);
              osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
              gain.gain.setValueAtTime(0.4 * intensity, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
              break;
      }
      osc.start(t);
      osc.stop(t + 0.5);
  }

  public playBossAttack() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(50, t);
    osc2.frequency.setValueAtTime(51, t); 
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(2000, t + 0.8);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.5);
    osc2.stop(t + 1.5);
  }
}

export const soundManager = new SoundManager();
