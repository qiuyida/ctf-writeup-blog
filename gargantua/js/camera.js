// GARGANTUA — 相机系统：电影镜头循环、OrbitControls、视角预设平滑过渡
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VIEWS } from './config.js';

const DEG = Math.PI / 180;

export class CameraRig {
  constructor(domElement, aspect) {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 400);
    this.camera.position.set(20, 3, 0);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4.5;
    this.controls.maxDistance = 80;
    this.controls.target.set(0, 0, 0);

    this.cinematic = true;
    this.cineTime = Math.random() * 100;
    this.camSpeed = 1;

    // 预设过渡
    this.tween = null; // {t0, dur, from:{...}, to:{...}, fovFrom, fovTo}

    // 用户开始拖拽 → 退出电影模式
    this.onUserInterrupt = null;
    this.controls.addEventListener('start', () => {
      if (this.cinematic && this.onUserInterrupt) this.onUserInterrupt();
    });

    this._spherical = new THREE.Spherical();
    this.applyView('edge', true);
  }

  // 电影镜头循环：缓慢呼吸的半径 + 摆动倾角 + 持续环绕
  updateCinematic(dt) {
    if (!this.cinematic || this.tween) return;
    this.cineTime += dt * this.camSpeed;
    const t = this.cineTime;
    const radius = 17 + 8.5 * Math.sin(t * 0.043 + 1.7);
    const polar = 1.32 + 0.52 * Math.sin(t * 0.031);
    const azimuth = t * 0.055;
    this._spherical.set(
      THREE.MathUtils.clamp(radius, 9, 32),
      THREE.MathUtils.clamp(polar, 0.3, 2.75),
      azimuth
    );
    this.camera.position.setFromSpherical(this._spherical);
    this.camera.lookAt(0, 0, 0);
  }

  setCinematic(on) {
    this.cinematic = on;
    if (on) this.tween = null;
    this.controls.enabled = !on || true; // 始终允许接管（拖拽即中断）
  }

  applyView(name, instant = false) {
    const v = VIEWS[name];
    if (!v) return;
    const target = new THREE.Spherical(v.radius, v.polar * DEG, v.azimuth * DEG);
    const cur = new THREE.Spherical().setFromVector3(this.camera.position);
    // 方位角取最短路径
    let dAz = target.theta - cur.theta;
    dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
    target.theta = cur.theta + dAz;

    if (instant) {
      this.camera.position.setFromSpherical(target);
      this.camera.fov = v.fov;
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(0, 0, 0);
      this.tween = null;
      return;
    }
    this.tween = {
      t: 0, dur: 1.6, from: cur, to: target,
      fovFrom: this.camera.fov, fovTo: v.fov,
    };
  }

  update(dt) {
    if (this.tween) {
      const tw = this.tween;
      tw.t += dt / tw.dur;
      let k = Math.min(tw.t, 1);
      k = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // easeInOutCubic
      const s = new THREE.Spherical(
        THREE.MathUtils.lerp(tw.from.radius, tw.to.radius, k),
        THREE.MathUtils.lerp(tw.from.phi, tw.to.phi, k),
        THREE.MathUtils.lerp(tw.from.theta, tw.to.theta, k)
      );
      this.camera.position.setFromSpherical(s);
      this.camera.fov = THREE.MathUtils.lerp(tw.fovFrom, tw.fovTo, k);
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(0, 0, 0);
      if (tw.t >= 1) this.tween = null;
    } else if (this.cinematic) {
      this.updateCinematic(dt);
    } else {
      this.controls.update();
    }
  }

  setAspect(aspect) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
