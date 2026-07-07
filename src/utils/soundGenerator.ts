// Web Audio API ambient soundscape and interval chime generator

class SoundGenerator {
  private ctx: AudioContext | null = null;
  private activeNodes: { [key: string]: any } = {};

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a gentle meditation bell or workout interval chime
  playChime(freq: number = 528, type: 'bell' | 'beep' = 'bell') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type === 'bell' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      if (type === 'bell') {
        // Tibetan bowl harmonic richness
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.5);
      } else {
        // Crisp workout interval beep
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (type === 'bell' ? 3.5 : 0.35));
    } catch (err) {
      console.warn('Audio not allowed or blocked:', err);
    }
  }

  // Start continuous ambient soundscape (rain pink noise or ocean waves)
  startAmbient(soundscape: 'rain' | 'waves' | 'bowls') {
    this.stopAmbient();
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (soundscape === 'rain' || soundscape === 'waves') {
        // Generate soothing pink noise
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.08; // gentle volume
          b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(soundscape === 'rain' ? 800 : 450, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

        if (soundscape === 'waves') {
          // LFO modulation for rolling ocean surf effect
          const lfo = this.ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // one wave every ~8 secs
          const lfoGain = this.ctx.createGain();
          lfoGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);
          lfo.start();
          this.activeNodes['lfo'] = lfo;
        }

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
        this.activeNodes['ambient'] = whiteNoise;
        this.activeNodes['gain'] = gain;
      } else if (soundscape === 'bowls') {
        // Binaural harmonic chord
        const freqs = [432, 528, 639];
        freqs.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          this.activeNodes[`bowl_${idx}`] = osc;
        });
      }
    } catch (e) {
      console.warn('Could not start ambient sound:', e);
    }
  }

  stopAmbient() {
    Object.keys(this.activeNodes).forEach(key => {
      try {
        if (this.activeNodes[key].stop) this.activeNodes[key].stop();
      } catch (e) {}
    });
    this.activeNodes = {};
  }
}

export const sound = new SoundGenerator();
