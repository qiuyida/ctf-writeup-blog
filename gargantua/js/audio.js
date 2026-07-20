// GARGANTUA — 可选氛围音乐：assets/ambient.mp3 循环播放，
// 文件缺失或解码失败时回退到 WebAudio 程序化深空和声，永不报错。
export class AmbientMusic {
  constructor() {
    this.playing = false;
    this.audio = new Audio('assets/ambient.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.55;
    this.audio.preload = 'auto';
    this._useFallback = false;
    this._ctx = null;
    this._nodes = null;
    this.audio.addEventListener('error', () => { this._useFallback = true; });
  }

  async toggle() {
    if (this.playing) { this.stop(); return false; }
    await this.play();
    return true;
  }

  async play() {
    this.playing = true;
    if (!this._useFallback) {
      try {
        await this.audio.play();
        return;
      } catch (_) {
        this._useFallback = true;
      }
    }
    this._startDrone();
  }

  stop() {
    this.playing = false;
    try { this.audio.pause(); } catch (_) {}
    if (this._nodes) {
      const { osc, ctx } = this._nodes;
      const t = ctx.currentTime;
      for (const o of osc) {
        try { o.stop(t + 0.8); } catch (_) {}
      }
      this._nodes.gain.gain.linearRampToValueAtTime(0, t + 0.7);
      setTimeout(() => { try { ctx.close(); } catch (_) {} }, 900);
      this._nodes = null;
      this._ctx = null;
    }
  }

  // WebAudio 回退：低频正弦垫底 + 五度泛音 + 缓慢滤波呼吸
  _startDrone() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 0.8;
    filter.connect(gain);
    gain.connect(ctx.destination);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const osc = [55, 82.41, 110, 164.81].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i < 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = [0.9, 0.5, 0.32, 0.16][i];
      o.connect(g);
      g.connect(filter);
      o.start();
      return o;
    });
    osc.push(lfo);
    this._ctx = ctx;
    this._nodes = { osc, gain, ctx };
  }
}
