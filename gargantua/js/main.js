// GARGANTUA — 主程序：启动、渲染循环、状态持久化、快捷键、URL 自动化接口、WebGL 恢复
import * as THREE from 'three';
import { PARAMS, PARAM_DEFAULTS, QUALITY, VIEWS, DEBUG_VIEWS, STORAGE_KEY, PHYS } from './config.js';
import { Raytracer } from './raytracer.js';
import { PostPipeline } from './post.js';
import { CameraRig } from './camera.js';
import { UI } from './ui.js';
import { AmbientMusic } from './audio.js';

const overlay = document.getElementById('overlay');
const overlayMsg = document.getElementById('overlay-msg');
const overlayBar = document.getElementById('overlay-progress');

function fatal(msg) {
  overlay.classList.remove('fade');
  overlay.classList.add('error');
  overlay.querySelector('.overlay-title').textContent = 'GARGANTUA';
  overlayMsg.textContent = msg;
}

function progress(p, msg) {
  overlayBar.style.width = `${(p * 100).toFixed(0)}%`;
  if (msg) overlayMsg.textContent = msg;
}

// ---------------- 状态 ----------------
const isMobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;

const state = {
  params: { ...PARAM_DEFAULTS },
  quality: isMobile ? 'standard' : 'high',
  view: 'edge',
  cinematic: true,
  debug: 0,
  hud: true,
  panelOpen: !isMobile,
  music: false,
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      params: state.params, quality: state.quality, view: state.view,
      cinematic: state.cinematic, panelOpen: state.panelOpen, music: state.music,
    }));
  } catch (_) {}
}
let saveTimer = 0;
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 300);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.params) for (const k of Object.keys(PARAM_DEFAULTS)) {
      if (typeof s.params[k] === 'number') state.params[k] = s.params[k];
    }
    if (QUALITY[s.quality]) state.quality = s.quality;
    if (VIEWS[s.view]) state.view = s.view;
    if (typeof s.cinematic === 'boolean') state.cinematic = s.cinematic;
    if (typeof s.panelOpen === 'boolean') state.panelOpen = s.panelOpen;
    if (typeof s.music === 'boolean') state.music = s.music;
  } catch (_) {}
}

// ---------------- URL 参数（截图自动化接口） ----------------
const url = new URL(location.href);
function applyURL() {
  const q = url.searchParams;
  if (VIEWS[q.get('view')]) state.view = q.get('view');
  if (QUALITY[q.get('quality')]) state.quality = q.get('quality');
  if (q.has('debug')) {
    const d = parseInt(q.get('debug'), 10);
    if (d >= 0 && d <= 9) state.debug = d;
  }
  if (q.has('cinematic')) state.cinematic = q.get('cinematic') !== '0';
  if (q.has('hud')) state.hud = q.get('hud') !== '0';
  if (q.has('t')) state.cineStart = parseFloat(q.get('t')) || 0;
  if (q.has('params')) {
    try {
      const over = JSON.parse(decodeURIComponent(q.get('params')));
      for (const k of Object.keys(PARAM_DEFAULTS)) {
        if (typeof over[k] === 'number') state.params[k] = over[k];
      }
    } catch (_) {}
  }
}

// ---------------- 渲染器 ----------------
let renderer, raytracer, post, rig, ui, music;
let simTime = 0;
let fpsEMA = 60;
let contextLost = false;

function renderSize() {
  const preset = QUALITY[state.quality];
  const dpr = Math.min(window.devicePixelRatio || 1, preset.dprCap);
  const w = Math.max(2, Math.floor(innerWidth * dpr * preset.renderScale));
  const h = Math.max(2, Math.floor(innerHeight * dpr * preset.renderScale));
  return { w, h };
}

function applyQuality() {
  const preset = QUALITY[state.quality];
  const { w, h } = renderSize();
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  raytracer.setSize(w, h);
  post.setSize(w, h, preset.bloomLevels);
  rig.setAspect(w / h);
  syncUniforms();
  ui.setActiveQuality(state.quality);
}

function syncUniforms() {
  const p = state.params;
  const u = raytracer.uniforms;
  const preset = QUALITY[state.quality];
  u.uSteps.value = Math.min(PHYS.MAX_STEPS, preset.steps);
  u.uCrossings.value = Math.min(p.crossings, preset.maxCrossings);
  u.uDebug.value = state.debug <= 7 ? state.debug : 0;
  u.uStepMul.value = p.stepMul;
  u.uDiskIn.value = p.diskInner;
  u.uDiskOut.value = p.diskOuter;
  u.uDiskTemp.value = p.diskTemp;
  u.uDiskBright.value = p.diskBright;
  u.uTurb.value = p.turbulence;
  u.uTurbSpeed.value = p.turbSpeed;
  u.uSpiral.value = p.spiral;
  u.uDoppler.value = p.doppler;
  u.uRedshift.value = p.redshift;
  u.uStarDensity.value = p.starDensity;
  u.uMilky.value = p.milkyWay;
  rig.camSpeed = p.camSpeed;
}

// 调试 8/9 → 后处理模式
function postMode() {
  if (state.debug === 8) return 1;
  if (state.debug === 9) return 2;
  return 0;
}

// ---------------- 主循环 ----------------
let lastT = performance.now();
let shotDone = false;

function frame(now) {
  requestAnimationFrame(frame);
  if (contextLost) return;
  const dt = Math.min((now - lastT) / 1000, 0.1);
  lastT = now;

  simTime += dt * state.params.timeScale;
  rig.update(dt);
  raytracer.updateCamera(rig.camera);
  raytracer.uniforms.uTime.value = simTime;

  raytracer.render(renderer, post.sceneRT);
  post.render(state.params, simTime, postMode());

  // FPS
  if (dt > 0) fpsEMA = fpsEMA * 0.95 + (1 / dt) * 0.05;

  // 截图自动化：渲染若干帧后自动导出 PNG
  const autoshot = url.searchParams.get('autoshot') === '1';
  if (autoshot && !shotDone) {
    const delay = parseInt(url.searchParams.get('shotdelay') || '1200', 10);
    if (now - bootT0 > delay) {
      shotDone = true;
      capture(true);
      window.__SHOT_READY = true;
      document.title = 'GARGANTUA [SHOT_READY]';
    }
  }
}

// ---------------- 截图 ----------------
function capture(download = true) {
  // 确保相机与 uniform 处于有效状态后再同步绘制读取
  rig.update(0);
  raytracer.updateCamera(rig.camera);
  raytracer.render(renderer, post.sceneRT);
  post.render(state.params, simTime, postMode());
  const canvas = renderer.domElement;
  const name = url.searchParams.get('shotname') ||
    `gargantua_${state.view}_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
  const finish = (blob) => {
    if (!blob) return;
    if (download) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
  };
  if (canvas.toBlob) canvas.toBlob(finish, 'image/png');
  return canvas.toDataURL('image/png');
}

// ---------------- 快捷键 ----------------
const QUALITY_ORDER = ['standard', 'high', 'cinematic'];
const VIEW_ORDER = ['edge', 'top', 'close', 'wide'];

function setView(name) {
  state.view = name;
  state.cinematic = false;
  rig.setCinematic(false);
  rig.applyView(name);
  ui.setActiveView(name);
  ui.setCinematic(false);
  saveSoon();
}

function setCinematic(on) {
  state.cinematic = on;
  rig.setCinematic(on);
  ui.setCinematic(on);
  if (on) ui.setActiveView(null);
  saveSoon();
}

function setQuality(q) {
  if (!QUALITY[q]) return;
  state.quality = q;
  applyQuality();
  saveSoon();
}

function setDebug(d) {
  state.debug = d;
  syncUniforms();
  ui.setDebug(d);
}

function resetParams() {
  state.params = { ...PARAM_DEFAULTS };
  for (const p of PARAMS) ui.setParam(p.id, p.def, p.fmt);
  syncUniforms();
  saveSoon();
}

function onKey(e) {
  if (e.target && (e.target.tagName === 'INPUT' && e.target.type !== 'range')) return;
  const k = e.key;
  if (k >= '0' && k <= '9') { setDebug(parseInt(k, 10)); return; }
  switch (k) {
    case ' ': e.preventDefault(); setCinematic(!state.cinematic); break;
    case 'F1': e.preventDefault(); setView('edge'); break;
    case 'F2': e.preventDefault(); setView('top'); break;
    case 'F3': e.preventDefault(); setView('close'); break;
    case 'F4': e.preventDefault(); setView('wide'); break;
    case 'c': case 'C': {
      const i = VIEW_ORDER.indexOf(state.view);
      setView(VIEW_ORDER[(i + 1) % VIEW_ORDER.length]); break;
    }
    case 'h': case 'H':
      state.hud = !state.hud;
      document.body.classList.toggle('no-hud', !state.hud); break;
    case 'u': case 'U':
      state.panelOpen = !state.panelOpen;
      ui.setPanel(state.panelOpen); saveSoon(); break;
    case 'l': case 'L': {
      const i = QUALITY_ORDER.indexOf(state.quality);
      setQuality(QUALITY_ORDER[(i + 1) % QUALITY_ORDER.length]); break;
    }
    case 'm': case 'M': toggleMusic(); break;
    case 'r': case 'R': resetParams(); break;
    case 'p': case 'P': capture(true); break;
  }
}

async function toggleMusic() {
  const on = await music.toggle();
  state.music = on;
  ui.setMusicState(on);
  saveSoon();
  return on;
}

// ---------------- 启动 ----------------
let bootT0 = performance.now();

async function boot() {
  progress(0.1, '正在初始化 WebGL2 积分器 …');
  loadState();
  applyURL();

  const canvas = document.getElementById('gl');
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // 截图接口需要
    });
  } catch (err) {
    fatal('WebGL 初始化失败：' + (err && err.message || err) + '\n请使用支持 WebGL2 的现代浏览器。');
    return;
  }
  if (!renderer.capabilities.isWebGL2) {
    fatal('需要 WebGL2 支持。\n请升级浏览器或启用硬件加速。');
    return;
  }
  renderer.autoClear = true;
  renderer.setClearColor(0x000000, 1);

  // WebGL 上下文丢失 / 恢复
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    contextLost = true;
    overlay.classList.remove('fade');
    overlay.classList.remove('error');
    overlay.querySelector('.overlay-title').textContent = 'GARGANTUA';
    overlayMsg.textContent = 'WebGL 上下文丢失，正在自动恢复 …';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    saveState();
    location.reload(); // 状态已持久化，整页重建最稳妥
  });

  progress(0.35, '正在编译测地线积分着色器 …');
  await new Promise(r => setTimeout(r, 30)); // 让遮罩绘制出来

  raytracer = new Raytracer();
  post = new PostPipeline(renderer);
  rig = new CameraRig(canvas, innerWidth / innerHeight);
  if (state.cineStart) rig.cineTime = state.cineStart;
  rig.setCinematic(state.cinematic);
  rig.applyView(state.view, true);
  rig.onUserInterrupt = () => setCinematic(false);

  music = new AmbientMusic();

  ui = new UI({
    onParam: (id, v) => { state.params[id] = v; syncUniforms(); saveSoon(); },
    onQuality: setQuality,
    onView: setView,
    onCinematicToggle: () => setCinematic(!state.cinematic),
    onReset: resetParams,
    onMusicToggle: toggleMusic,
  });
  for (const p of PARAMS) ui.setParam(p.id, state.params[p.id], p.fmt);
  ui.setActiveView(state.cinematic ? null : state.view);
  ui.setCinematic(state.cinematic);
  ui.setPanel(state.panelOpen);
  ui.setDebug(state.debug);
  document.body.classList.toggle('no-hud', !state.hud);

  // 着色器编译检查（先渲染一帧触发编译，读取诊断）
  applyQuality();
  rig.update(0);
  raytracer.updateCamera(rig.camera);
  try {
    raytracer.render(renderer, post.sceneRT);
    post.render(state.params, 0, 0);
  } catch (err) {
    fatal('着色器编译失败：' + (err && err.message || err));
    return;
  }
  if (renderer.debug.checkShaderErrors) {
    const gl = renderer.getContext();
    const err = gl.getError();
    if (err !== gl.NO_ERROR) {
      console.warn('GL 状态码非零（继续运行）：', err);
    }
  }

  progress(0.8, '正在预热渲染管线 …');

  window.addEventListener('resize', () => { applyQuality(); });
  window.addEventListener('keydown', onKey);

  // 音乐持久化恢复（浏览器要求用户手势，自动尝试失败则等待 M 键）
  if (state.music) {
    const tryPlay = async () => {
      if (!state.music) return;
      try { await toggleMusic(); } catch (_) {}
      document.removeEventListener('pointerdown', tryPlay);
    };
    // toggleMusic 会翻转状态，这里先恢复标志再于首次手势时播放
    state.music = false;
    document.addEventListener('pointerdown', tryPlay, { once: true });
  }

  // 自动化钩子
  window.GARGANTUA = {
    version: '1.0.0',
    state,
    setParam: (id, v) => {
      if (id in PARAM_DEFAULTS && typeof v === 'number') {
        state.params[id] = v; ui.setParam(id, v); syncUniforms(); saveSoon();
      }
    },
    setView, setQuality, setDebug, setCinematic,
    capture: () => capture(false),
    stats: () => ({ fps: fpsEMA, hdr: post.hdr, size: renderSize() }),
  };

  bootT0 = performance.now();
  requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(frame); });

  // HUD 统计刷新
  setInterval(() => {
    const { w, h } = renderSize();
    ui.setStats({
      fps: fpsEMA,
      res: `${w}×${h}`,
      steps: raytracer.uniforms.uSteps.value,
      quality: QUALITY[state.quality].label,
    });
  }, 500);

  progress(1, '完成');
  setTimeout(() => overlay.classList.add('fade'), 250);
  window.__GARG_READY = true;
}

boot().catch(err => {
  console.error(err);
  fatal('启动失败：' + (err && err.message || err));
});
