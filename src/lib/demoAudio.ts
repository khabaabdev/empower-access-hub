/**
 * AmbientSoundtrack - a tiny, dependency-free Web Audio soundscape for the demo player.
 * Warm synth pad + gentle pentatonic pulse, with smooth ducking while narration speaks.
 * No network requests, no audio files: everything is synthesized locally.
 */

type Ctor = typeof AudioContext;

export class AmbientSoundtrack {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private volume = 0.55;
  private ducked = false;
  private built = false;

  private target(): number {
    const base = Math.max(0.02, this.volume) * 0.2;
    return this.ducked ? base * 0.3 : base;
  }

  private get ac(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === "undefined") return null;
    const CtorRef: Ctor | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
    if (!CtorRef) return null;
    this.ctx = new CtorRef();
    return this.ctx;
  }

  async start(): Promise<void> {
    const ctx = this.ac;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* ignored: autoplay policy */
      }
    }
    if (!this.built) this.build();
    if (!this.master) return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(this.target(), ctx.currentTime, 0.6);
    if (this.timer === null && typeof window !== "undefined") {
      this.timer = window.setInterval(() => this.pulse(), 540);
    }
  }

  private build(): void {
    const ctx = this.ac;
    if (!ctx) return;
    this.built = true;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.82;
    master.connect(analyser);
    analyser.connect(ctx.destination);
    this.master = master;
    this.analyser = analyser;

    const music = ctx.createGain();
    music.gain.value = 1;
    music.connect(master);
    this.music = music;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 820;
    filter.Q.value = 0.7;
    filter.connect(music);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 300;
    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    lfo.start();

    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    wet.connect(master);
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.33;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    filter.connect(delay);

    const pad: { freq: number; type: OscillatorType }[] = [
      { freq: 110, type: "sine" },
      { freq: 164.81, type: "triangle" },
      { freq: 220, type: "sine" },
      { freq: 277.18, type: "triangle" },
    ];

    pad.forEach((voice, i) => {
      const osc = ctx.createOscillator();
      osc.type = voice.type;
      osc.frequency.value = voice.freq;
      osc.detune.value = i * 5 - 8;
      const gain = ctx.createGain();
      gain.gain.value = 0.13 - i * 0.02;
      const trem = ctx.createOscillator();
      trem.frequency.value = 0.1 + i * 0.04;
      const tremDepth = ctx.createGain();
      tremDepth.gain.value = gain.gain.value * 0.45;
      trem.connect(tremDepth);
      tremDepth.connect(gain.gain);
      trem.start();
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
    });
  }

  private pulse(): void {
    const ctx = this.ctx;
    const music = this.music;
    if (!ctx || !music) return;
    const scale = [440, 493.88, 554.37, 659.25, 739.99, 880];
    const freq = scale[this.step % scale.length];
    this.step += 1;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.085, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
    osc.connect(gain);
    gain.connect(music);
    osc.start(now);
    osc.stop(now + 1.2);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value));
    const ctx = this.ctx;
    if (ctx && this.master) {
      this.master.gain.setTargetAtTime(this.target(), ctx.currentTime, 0.25);
    }
  }

  duck(active: boolean): void {
    if (this.ducked === active) return;
    this.ducked = active;
    const ctx = this.ctx;
    if (ctx && this.master) {
      this.master.gain.setTargetAtTime(this.target(), ctx.currentTime, active ? 0.18 : 0.5);
    }
  }

  pause(): void {
    if (this.timer !== null && typeof window !== "undefined") {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.ducked = false;
    const ctx = this.ctx;
    if (ctx && this.master) {
      this.master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
    }
  }

  /** Normalized 0..1 level per bar, sampled from the live analyser. */
  getBars(count = 18): number[] {
    const analyser = this.analyser;
    if (!analyser) return new Array(count).fill(0);
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buffer);
    const step = Math.max(1, Math.floor(buffer.length / count));
    const out: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const raw = buffer[i * step] ?? 0;
      out.push(Math.min(1, raw / 210));
    }
    return out;
  }
}