// GARGANTUA — HUD / 参数面板 / 按钮绑定（纯 DOM，无依赖）
import { PARAMS, DEBUG_VIEWS } from './config.js';

export class UI {
  // callbacks: {onParam(id,val), onQuality(q), onView(v), onCinematicToggle(),
  //             onReset(), onMusicToggle(), onDebugInfo(d)}
  constructor(callbacks) {
    this.cb = callbacks;
    this.sliders = {};
    this._buildPanel();
    this._bindViews();
    this._bindQuality();
    this._bindButtons();
  }

  _buildPanel() {
    const body = document.getElementById('panel-body');
    body.innerHTML = '';
    let group = null, groupEl = null;
    for (const p of PARAMS) {
      if (p.group !== group) {
        group = p.group;
        groupEl = document.createElement('div');
        groupEl.className = 'pgroup';
        const title = document.createElement('div');
        title.className = 'pgroup-title';
        title.textContent = group;
        groupEl.appendChild(title);
        body.appendChild(groupEl);
      }
      const wrap = document.createElement('div');
      wrap.className = 'param';
      const label = document.createElement('div');
      label.className = 'param-label';
      const name = document.createElement('span');
      name.textContent = p.label;
      const val = document.createElement('span');
      val.className = 'param-value';
      label.appendChild(name); label.appendChild(val);
      const input = document.createElement('input');
      input.type = 'range';
      input.min = p.min; input.max = p.max; input.step = p.step;
      input.value = p.def;
      input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        val.textContent = v.toFixed(p.fmt);
        this.cb.onParam(p.id, v);
      });
      wrap.appendChild(label); wrap.appendChild(input);
      groupEl.appendChild(wrap);
      this.sliders[p.id] = { input, val, fmt: p.fmt };
    }
  }

  setParam(id, v, fmt) {
    const s = this.sliders[id];
    if (!s) return;
    s.input.value = v;
    s.val.textContent = Number(v).toFixed(fmt !== undefined ? fmt : s.fmt);
  }

  _bindViews() {
    this.viewBtns = [...document.querySelectorAll('#views .view-btn[data-view]')];
    for (const b of this.viewBtns) {
      b.addEventListener('click', () => this.cb.onView(b.dataset.view));
    }
    this.cineBtn = document.getElementById('btn-cine');
    this.cineBtn.addEventListener('click', () => this.cb.onCinematicToggle());
  }

  setActiveView(name) {
    for (const b of this.viewBtns) b.classList.toggle('active', b.dataset.view === name);
  }
  setCinematic(on) { this.cineBtn.classList.toggle('active', on); }

  _bindQuality() {
    this.qBtns = [...document.querySelectorAll('#quality .q-btn')];
    for (const b of this.qBtns) {
      b.addEventListener('click', () => this.cb.onQuality(b.dataset.quality));
    }
  }
  setActiveQuality(q) {
    for (const b of this.qBtns) b.classList.toggle('active', b.dataset.quality === q);
  }

  _bindButtons() {
    document.getElementById('btn-reset').addEventListener('click', () => this.cb.onReset());
    const musicBtn = document.getElementById('btn-music');
    musicBtn.addEventListener('click', async () => {
      const on = await this.cb.onMusicToggle();
      musicBtn.classList.toggle('playing', !!on);
    });
    this.musicBtn = musicBtn;
    document.getElementById('btn-panel-close').addEventListener('click', () => this.setPanel(false));
    document.getElementById('btn-panel-open').addEventListener('click', () => this.setPanel(true));
  }

  setPanel(open) {
    document.getElementById('panel').classList.toggle('hidden', !open);
    document.getElementById('btn-panel-open').classList.toggle('hidden', open);
  }
  isPanelOpen() { return !document.getElementById('panel').classList.contains('hidden'); }

  setMusicState(on) { this.musicBtn.classList.toggle('playing', on); }

  setStats({ fps, res, steps, quality }) {
    document.getElementById('stat-fps').textContent = `${fps.toFixed(0)} FPS`;
    document.getElementById('stat-res').textContent = res;
    document.getElementById('stat-steps').textContent = `${steps} 步`;
    document.getElementById('stat-quality').textContent = quality;
  }

  setDebug(d) {
    const badge = document.getElementById('debug-badge');
    if (d === 0) { badge.classList.add('hidden'); return; }
    badge.classList.remove('hidden');
    document.getElementById('debug-name').textContent = `${d} · ${DEBUG_VIEWS[d] || '?'}`;
  }
}
