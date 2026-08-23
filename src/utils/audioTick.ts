// Web Audio API Mechanical Watch Acoustic Escapement Simulator
// Synthesizes the authentic double-click sound (pallet jewel impulse + banking pin impact) of a mechanical movement

class WatchAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Generate an authentic mechanical escapement click
  private playTick(pitch: number = 3200, volume: number = 0.15) {
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // Component 1: Pallet fork jewel impact (crisp high frequency ping)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(pitch, now);
    osc1.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.008);

    gain1.gain.setValueAtTime(volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.015);

    // Component 2: Subtle banking pin echo (3ms later)
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(pitch * 0.7, now + 0.003);
    osc2.frequency.exponentialRampToValueAtTime(800, now + 0.014);

    gain2.gain.setValueAtTime(volume * 0.5, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);

    osc2.start(now + 0.003);
    osc2.stop(now + 0.02);
  }

  public startTicking(vph: number = 28800, volume: number = 0.12): boolean {
    this.stop();
    this.initContext();

    if (vph <= 0) {
      // Spring drive or quartz silent glide
      return false;
    }

    this.isPlaying = true;
    const ticksPerSecond = vph / 3600;
    const intervalMs = 1000 / ticksPerSecond;

    let toggleSound = false;
    this.intervalId = window.setInterval(() => {
      // Alternate slight pitch for tick vs tock (entry pallet vs exit pallet)
      const pitch = toggleSound ? 3400 : 3100;
      this.playTick(pitch, volume);
      toggleSound = !toggleSound;
    }, intervalMs);

    return true;
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const watchAudioEngine = new WatchAudioEngine();
