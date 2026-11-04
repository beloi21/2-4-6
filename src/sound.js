// All sound is synthesised, so there are no audio files to download.

export function createSound(initiallyOn) {
  let on = initiallyOn;
  let ctx = null;
  let noise = null;

  function context() {
    if (!on) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function burst(ac, { freq, q = 1, gain, length, delay = 0 }) {
    const t = ac.currentTime + delay;
    const src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = ac.createGain();
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0008, t + length);
    src.connect(filter).connect(amp).connect(ac.destination);
    src.start(t, Math.random());
    src.stop(t + length + 0.02);
  }

  return {
    get on() {
      return on;
    },
    set(value) {
      on = value;
    },
    /** Clay on clay. */
    tick() {
      const ac = context();
      if (ac) burst(ac, { freq: 1900, q: 3, gain: 0.16, length: 0.05 });
    },
    /** A brick landing. */
    thud(strength = 1) {
      const ac = context();
      if (!ac) return;
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(48, t + 0.13);
      const amp = ac.createGain();
      amp.gain.setValueAtTime(0.5 * strength, t);
      amp.gain.exponentialRampToValueAtTime(0.0008, t + 0.17);
      osc.connect(amp).connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.2);
      burst(ac, { freq: 720, q: 0.7, gain: 0.26 * strength, length: 0.09 });
    },
    whoosh() {
      const ac = context();
      if (ac) burst(ac, { freq: 480, q: 0.6, gain: 0.16, length: 0.24 });
    },
    /** The rude noise. */
    raspberry() {
      const ac = context();
      if (!ac) return;
      const t = ac.currentTime;
      const length = 1.05;
      const osc = ac.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(118, t);
      osc.frequency.linearRampToValueAtTime(82, t + length);
      const flutter = ac.createOscillator();
      flutter.frequency.value = 31;
      const flutterDepth = ac.createGain();
      flutterDepth.gain.value = 0.2;
      const amp = ac.createGain();
      amp.gain.setValueAtTime(0.0008, t);
      amp.gain.exponentialRampToValueAtTime(0.26, t + 0.05);
      amp.gain.setValueAtTime(0.26, t + length - 0.18);
      amp.gain.exponentialRampToValueAtTime(0.0008, t + length);
      const tone = ac.createBiquadFilter();
      tone.type = 'bandpass';
      tone.frequency.value = 620;
      tone.Q.value = 0.8;
      flutter.connect(flutterDepth).connect(amp.gain);
      osc.connect(tone).connect(amp).connect(ac.destination);
      osc.start(t);
      flutter.start(t);
      osc.stop(t + length + 0.02);
      flutter.stop(t + length + 0.02);
    },
  };
}
