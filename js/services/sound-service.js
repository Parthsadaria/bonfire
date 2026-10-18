/**
 * VIRGIL - PROCEDURAL SOUND SYNTHESIZER
 */

(() => {
  class SoundService {
    constructor() {
      this.ac = null;
      this.enabled = false;
    }

    play(f, d = 0.08, type = "square", v = 0.03, at = 0) {
      if (!this.enabled) return;
      try {
        this.ac = this.ac || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ac.state === 'suspended') {
          this.ac.resume();
        }
        const o = this.ac.createOscillator();
        const g = this.ac.createGain();
        const t = this.ac.currentTime + at;
        o.type = type;
        o.frequency.value = f;
        g.gain.setValueAtTime(v, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(this.ac.destination);
        o.start(t);
        o.stop(t + d);
      } catch (e) {}
    }

    tick() {
      this.play(980, 0.035, "square", 0.012);
    }

    click() {
      this.play(420, 0.07);
    }

    search() {
      this.play(523, 0.07);
      this.play(784, 0.12, "square", 0.03, 0.07);
    }

    ach() {
      [523, 659, 784, 1047].forEach((f, i) => this.play(f, 0.14, "square", 0.035, i * 0.08));
    }

    died() {
      this.play(95, 1.1, "sawtooth", 0.05);
    }

    setEnabled(val) {
      this.enabled = Boolean(val);
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }
  }

  const sound = new SoundService();

  window.Virgil = window.Virgil || {};
  window.Virgil.SoundService = SoundService;
  window.Virgil.sound = sound;
})();
