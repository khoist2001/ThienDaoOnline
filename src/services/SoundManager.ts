// Xianxia Web Audio Ambient Synthesizer & Sound FX Manager
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Muted by default per user specification ("Không tự phát khi mở trang")
  private bgmGain: GainNode | null = null;
  private isPlayingBgm: boolean = false;
  private ambientTimer: any = null;

  constructor() {
    // Lazy init audio context on user action
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.initCtx();
      this.startAmbientBgm();
    } else {
      this.stopAmbientBgm();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play button click sound (crisp jade chime)
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1); // A6

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Play Breakthrough / Lightning sound
  public playBreakthroughSound(success: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (success) {
      // Heavenly Chime Array
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.1);
        osc.stop(this.ctx!.currentTime + idx * 0.1 + 0.8);
      });
    } else {
      // Thunder Rumble
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    }
  }

  // Synthesizes continuous pentatonic Xianxia flute melodies (D, E, F#, A, B pentatonic scale)
  private startAmbientBgm() {
    if (this.isPlayingBgm || !this.ctx) return;
    this.isPlayingBgm = true;

    const scale = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25, 739.99]; // Pentatonic notes
    
    const playNextNote = () => {
      if (!this.isPlayingBgm || this.isMuted || !this.ctx) return;

      const note = scale[Math.floor(Math.random() * scale.length)];
      const duration = 1.5 + Math.random() * 2.0;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);
      
      // Slight pitch bend for Asian bamboo flute vibrato effect
      osc.frequency.linearRampToValueAtTime(note * (1 + (Math.random() * 0.02 - 0.01)), this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);

      const nextDelay = (duration * 0.7 + Math.random() * 1.5) * 1000;
      this.ambientTimer = setTimeout(playNextNote, nextDelay);
    };

    playNextNote();
  }

  private stopAmbientBgm() {
    this.isPlayingBgm = false;
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }
}

export const soundManager = new SoundManager();
