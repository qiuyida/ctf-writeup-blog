// GARGANTUA — HDR 后处理管线：亮部提取 → 多级下采样 + 高斯模糊 → ACES 合成
import * as THREE from 'three';
import { FullScreenPass } from './raytracer.js';
import { BRIGHT_FRAG, DOWN_FRAG, BLUR_FRAG, COMPOSITE_FRAG } from './shaders.js';

const MAX_BLOOM_LEVELS = 6;

function makeRT(w, h, type) {
  return new THREE.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
    type,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export class PostPipeline {
  constructor(renderer) {
    this.renderer = renderer;
    // WebGL2 + EXT_color_buffer_float 才用半浮点，否则退回 LDR（自动降级）
    const hdrOK = renderer.capabilities.isWebGL2 &&
      !!renderer.extensions.get('EXT_color_buffer_float');
    this.rtType = hdrOK ? THREE.HalfFloatType : THREE.UnsignedByteType;
    this.hdr = hdrOK;

    this.levels = 5;
    this.sceneRT = null;
    this.bloomRT = [];   // 每级 [ping, pong]
    this.w = 1; this.h = 1;

    this.brightPass = new FullScreenPass(BRIGHT_FRAG, {
      tSrc: { value: null }, uThresh: { value: 1.0 },
    });
    this.downPass = new FullScreenPass(DOWN_FRAG, {
      tSrc: { value: null }, uTexel: { value: new THREE.Vector2() },
    });
    this.blurPass = new FullScreenPass(BLUR_FRAG, {
      tSrc: { value: null },
      uDir: { value: new THREE.Vector2(1, 0) },
      uTexel: { value: new THREE.Vector2() },
    });
    const compUniforms = {
      tScene: { value: null },
      uBloomInt: { value: 1.0 }, uExposure: { value: 1.25 },
      uChroma: { value: 0.5 }, uVignette: { value: 0.35 },
      uGrain: { value: 0.25 }, uTime: { value: 0 },
      uBloomLevels: { value: 5 },
      uMode: { value: 0 },
    };
    for (let i = 0; i < MAX_BLOOM_LEVELS; i++) {
      compUniforms['tB' + i] = { value: null };
    }
    this.compositePass = new FullScreenPass(COMPOSITE_FRAG, compUniforms);
  }

  setSize(w, h, levels) {
    this.w = w; this.h = h;
    this.levels = Math.min(levels, MAX_BLOOM_LEVELS);
    if (this.sceneRT) this.sceneRT.dispose();
    this.sceneRT = makeRT(w, h, this.rtType);
    for (const pair of this.bloomRT) { pair[0].dispose(); pair[1].dispose(); }
    this.bloomRT = [];
    let bw = Math.floor(w / 2), bh = Math.floor(h / 2);
    for (let i = 0; i < MAX_BLOOM_LEVELS; i++) {
      this.bloomRT.push([makeRT(bw, bh, this.rtType), makeRT(bw, bh, this.rtType)]);
      bw = Math.floor(bw / 2); bh = Math.floor(bh / 2);
    }
  }

  // 对 sceneRT 内容执行 bloom + 合成到屏幕
  render(params, time, mode) {
    const r = this.renderer;
    const L = this.levels;

    // 1) 亮部提取到第 0 级
    this.brightPass.material.uniforms.tSrc.value = this.sceneRT.texture;
    this.brightPass.material.uniforms.uThresh.value = params.bloomThresh;
    this.brightPass.render(r, this.bloomRT[0][0]);

    // 2) 逐级下采样
    for (let i = 1; i < L; i++) {
      const src = this.bloomRT[i - 1][0];
      this.downPass.material.uniforms.tSrc.value = src.texture;
      this.downPass.material.uniforms.uTexel.value.set(1 / src.width, 1 / src.height);
      this.downPass.render(r, this.bloomRT[i][0]);
    }

    // 3) 每级双向高斯模糊
    for (let i = 0; i < L; i++) {
      const [ping, pong] = this.bloomRT[i];
      this.blurPass.material.uniforms.uTexel.value.set(1 / ping.width, 1 / ping.height);
      this.blurPass.material.uniforms.tSrc.value = ping.texture;
      this.blurPass.material.uniforms.uDir.value.set(1, 0);
      this.blurPass.render(r, pong);
      this.blurPass.material.uniforms.tSrc.value = pong.texture;
      this.blurPass.material.uniforms.uDir.value.set(0, 1);
      this.blurPass.render(r, ping);
    }

    // 4) 合成到屏幕
    const u = this.compositePass.material.uniforms;
    u.tScene.value = this.sceneRT.texture;
    for (let i = 0; i < MAX_BLOOM_LEVELS; i++) {
      u['tB' + i].value = this.bloomRT[i][0].texture;
    }
    u.uBloomLevels.value = L;
    u.uBloomInt.value = params.bloomInt;
    u.uExposure.value = params.exposure;
    u.uChroma.value = params.chroma;
    u.uVignette.value = params.vignette;
    u.uGrain.value = params.grain;
    u.uTime.value = time;
    u.uMode.value = mode;
    this.compositePass.render(r, null);
  }

  dispose() {
    if (this.sceneRT) this.sceneRT.dispose();
    for (const pair of this.bloomRT) { pair[0].dispose(); pair[1].dispose(); }
    this.brightPass.dispose();
    this.downPass.dispose();
    this.blurPass.dispose();
    this.compositePass.dispose();
  }
}
