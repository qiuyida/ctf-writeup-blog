// GARGANTUA — 全屏通道基类与测地线光线追踪通道
import * as THREE from 'three';
import { QUAD_VERT, RAYTRACE_FRAG } from './shaders.js';
import { PHYS } from './config.js';

// 全屏三角形通道（所有后处理共用）
export class FullScreenPass {
  constructor(fragShader, uniforms) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    this.material = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: fragShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  render(renderer, target) {
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

export class Raytracer {
  constructor() {
    this.uniforms = {
      uRes:        { value: new THREE.Vector2(1, 1) },
      uCamPos:     { value: new THREE.Vector3() },
      uCamRight:   { value: new THREE.Vector3(1, 0, 0) },
      uCamUp:      { value: new THREE.Vector3(0, 1, 0) },
      uCamFwd:     { value: new THREE.Vector3(0, 0, -1) },
      uTanFov:     { value: 0.5 },
      uAspect:     { value: 1 },
      uTime:       { value: 0 },
      uSteps:      { value: 160 },
      uCrossings:  { value: 3 },
      uDebug:      { value: 0 },
      uStepMul:    { value: 1 },
      uDiskIn:     { value: 6 },
      uDiskOut:    { value: 19 },
      uDiskTemp:   { value: 1.05 },
      uDiskBright: { value: 1.5 },
      uTurb:       { value: 0.85 },
      uTurbSpeed:  { value: 1 },
      uSpiral:     { value: 3.5 },
      uDoppler:    { value: 1 },
      uRedshift:   { value: 1 },
      uStarDensity:{ value: 1 },
      uMilky:      { value: 1 },
    };
    this.pass = new FullScreenPass(RAYTRACE_FRAG, this.uniforms);
  }

  // camera: THREE.PerspectiveCamera
  updateCamera(camera) {
    const u = this.uniforms;
    u.uCamPos.value.copy(camera.position);
    const e = camera.matrixWorld.elements;
    u.uCamRight.value.set(e[0], e[1], e[2]).normalize();
    u.uCamUp.value.set(e[4], e[5], e[6]).normalize();
    u.uCamFwd.value.set(-e[8], -e[9], -e[10]).normalize();
    u.uTanFov.value = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5);
    u.uAspect.value = camera.aspect;
  }

  setSize(w, h) { this.uniforms.uRes.value.set(w, h); }
  render(renderer, target) { this.pass.render(renderer, target); }
  dispose() { this.pass.dispose(); }
}

export { PHYS };
