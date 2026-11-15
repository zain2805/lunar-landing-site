/**
 * Procedural Space Audio Synthesizer & Speech Narration Engine
 * Built using the Web Audio API and Web Speech API.
 * 100% self-contained, no external audio files required.
 * Configured with authentic male astronaut/mission director voice narration.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.6;
    this.narrationMuted = false;

    // Node references
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    
    // Synthesizer nodes
    this.activeOscillators = [];
    this.isPlayingMusic = false;
    this.musicTrack = null; // 'solar', 'milkyway', 'dashboard'
    this.ambientInterval = null;

    // Speech synthesis
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.selectedMaleVoice = null;
    this.initVoices();
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initVoices() {
    if (!this.speechSynthesis) return;
    const findMaleVoice = () => {
      const voices = this.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;
      
      // Look specifically for deep authoritative male English voices
      const maleNames = [
        'Google US English Male',
        'Google UK English Male',
        'Microsoft David',
        'Microsoft Mark',
        'Microsoft George',
        'Daniel',
        'Oliver',
        'Guy',
        'Alex',
        'Fred',
        'en-US-Standard-B',
        'en-US-Standard-D',
        'en-US-Wavenet-B',
        'en-US-Wavenet-D',
      ];

      for (const name of maleNames) {
        const found = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) {
          this.selectedMaleVoice = found;
          return;
        }
      }
      
      // Fallback: any voice containing 'male' or first English voice
      const maleFallback = voices.find(v => 
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man')) && v.lang.startsWith('en')
      );
      this.selectedMaleVoice = maleFallback || voices.find(v => v.lang.startsWith('en')) || voices[0];
    };

    findMaleVoice();
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = findMaleVoice;
    }
  }

  /**
   * Speak narration in an authoritative, cinematic male voice
   */
  speakNarration(callback) {
    if (this.narrationMuted || !this.speechSynthesis) {
      if (callback) callback();
      return;
    }

    this.speechSynthesis.cancel();

    const text = "Welcome to the Lunar Landing Site Navigator. All systems nominal. Explore the lunar South Pole, analyse potential landing locations, and discover the safest landing destination for future lunar exploration missions. Your journey begins now.";
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.selectedMaleVoice) {
      utterance.voice = this.selectedMaleVoice;
    }
    
    // Male voice settings: deeper pitch and deliberate pace
    utterance.pitch = 0.86;
    utterance.rate = 0.90;
    utterance.volume = this.isMuted ? 0 : 0.95;

    utterance.onend = () => {
      if (callback) callback();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      if (callback) callback();
    };

    this.speechSynthesis.speak(utterance);
  }

  /**
   * Speak "Get Started" in male voice when button is triggered
   */
  speakGetStarted(callback) {
    if (this.narrationMuted || !this.speechSynthesis) {
      if (callback) callback();
      return;
    }

    this.speechSynthesis.cancel();
    const text = "Get Started. Initiating lunar South Pole trajectory.";
    const utterance = new SpeechSynthesisUtterance(text);

    if (this.selectedMaleVoice) {
      utterance.voice = this.selectedMaleVoice;
    }

    utterance.pitch = 0.85;
    utterance.rate = 0.92;
    utterance.volume = this.isMuted ? 0 : 0.95;

    utterance.onend = () => {
      if (callback) callback();
    };

    utterance.onerror = () => {
      if (callback) callback();
    };

    this.speechSynthesis.speak(utterance);
  }

  stopNarration() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Play cinematic ambient space chords
   */
  playMusic(track = 'solar') {
    this.ensureContext();
    if (!this.ctx) return;

    if (this.musicTrack === track && this.isPlayingMusic) return;
    this.stopMusic();

    this.isPlayingMusic = true;
    this.musicTrack = track;

    // Rich chord progressions using sine and triangle synthesis with lowpass filtering
    let frequencies = [55, 110, 164.81, 220, 329.63]; // A major 9th / atmospheric space chord
    if (track === 'milkyway') {
      frequencies = [65.41, 130.81, 196.00, 261.63, 392.00]; // C dynamic warp chord
    } else if (track === 'dashboard') {
      frequencies = [41.2, 82.4, 123.47, 164.81, 246.94]; // Low E deep space rumble
    }

    const t = this.ctx.currentTime;
    frequencies.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      // Lowpass filter for deep space warm ambience
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280 + index * 80, t);

      // Gentle pulsating envelope
      const baseVol = 0.04 / (index + 1);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(baseVol, t + 3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      this.activeOscillators.push({ osc, gain, baseVol });
    });

    // Subtle LFO breath for living atmosphere
    if (!this.ambientInterval) {
      this.ambientInterval = setInterval(() => {
        if (!this.ctx || !this.isPlayingMusic) return;
        const now = this.ctx.currentTime;
        this.activeOscillators.forEach((item, idx) => {
          const mod = 1 + Math.sin(now * 0.4 + idx) * 0.2;
          try {
            item.gain.gain.setValueAtTime(item.baseVol * mod, now);
          } catch(e) {}
        });
      }, 500);
    }
  }

  stopMusic() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    const t = this.ctx ? this.ctx.currentTime : 0;
    this.activeOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1);
        osc.stop(t + 1.1);
      } catch (e) {}
    });
    this.activeOscillators = [];
    this.isPlayingMusic = false;
  }

  /**
   * Sound Effects
   */
  playClick() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  playTargetLock() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.setValueAtTime(0.12, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.26);
    });
  }

  playRocketThrust() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, t);
    filter.frequency.linearRampToValueAtTime(420, t + 1.2);
    filter.frequency.linearRampToValueAtTime(120, t + 2.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.6);
    gain.gain.linearRampToValueAtTime(0.001, t + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playServoDeploy() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(540, t + 0.4);
    osc.frequency.linearRampToValueAtTime(400, t + 0.8);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.setValueAtTime(0.08, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.86);
  }

  playCalculationComplete() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.09);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.setValueAtTime(0.14, t + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.36);
    });
  }

  playTransition() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.4);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.46);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  toggleNarration() {
    this.narrationMuted = !this.narrationMuted;
    if (this.narrationMuted) {
      this.stopNarration();
    }
    return this.narrationMuted;
  }
}

const soundManager = new SoundEngine();
export default soundManager;
