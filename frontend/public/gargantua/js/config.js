// GARGANTUA — 全局配置：21 项参数、质量档、视角预设、调试视图

export const PARAMS = [
  // ---- 吸积盘 ----
  { id: 'diskInner',   group: '吸积盘', label: '盘内半径 (ISCO)', min: 3.1,  max: 12,  step: 0.1,  def: 6.0,  fmt: 2 },
  { id: 'diskOuter',   group: '吸积盘', label: '盘外半径',        min: 10,   max: 40,  step: 0.5,  def: 19.0, fmt: 1 },
  { id: 'diskTemp',    group: '吸积盘', label: '盘温度',          min: 0.2,  max: 3,   step: 0.01, def: 0.55, fmt: 2 },
  { id: 'diskBright',  group: '吸积盘', label: '盘亮度',          min: 0,    max: 5,   step: 0.01, def: 1.2,  fmt: 2 },
  { id: 'turbulence',  group: '吸积盘', label: '湍流强度',        min: 0,    max: 2,   step: 0.01, def: 0.85, fmt: 2 },
  { id: 'turbSpeed',   group: '吸积盘', label: '湍流速度',        min: 0,    max: 3,   step: 0.01, def: 1.0,  fmt: 2 },
  { id: 'spiral',      group: '吸积盘', label: '旋臂缠绕',        min: 0,    max: 10,  step: 0.1,  def: 3.5,  fmt: 1 },
  // ---- 相对论效应 ----
  { id: 'doppler',     group: '相对论效应', label: 'Doppler 增亮', min: 0, max: 1, step: 0.01, def: 1, fmt: 2 },
  { id: 'redshift',    group: '相对论效应', label: '引力红移',     min: 0, max: 1, step: 0.01, def: 1, fmt: 2 },
  // ---- 星空背景 ----
  { id: 'starDensity', group: '星空背景', label: '恒星密度',  min: 0, max: 2.5, step: 0.01, def: 1.0, fmt: 2 },
  { id: 'milkyWay',    group: '星空背景', label: '银河强度',  min: 0, max: 2.5, step: 0.01, def: 1.0, fmt: 2 },
  // ---- 积分器 ----
  { id: 'stepMul',     group: '积分器', label: '步长倍率',     min: 0.25, max: 2, step: 0.01, def: 1, fmt: 2 },
  { id: 'crossings',   group: '积分器', label: '盘面穿越次数', min: 1,    max: 4, step: 1,    def: 3, fmt: 0 },
  // ---- 后处理 ----
  { id: 'exposure',    group: '后处理', label: '曝光',        min: 0.1, max: 4, step: 0.01, def: 1.1,  fmt: 2 },
  { id: 'bloomInt',    group: '后处理', label: 'Bloom 强度',  min: 0,   max: 3, step: 0.01, def: 0.65, fmt: 2 },
  { id: 'bloomThresh', group: '后处理', label: 'Bloom 阈值',  min: 0,   max: 3, step: 0.01, def: 1.6,  fmt: 2 },
  { id: 'chroma',      group: '后处理', label: '色散',        min: 0,   max: 2, step: 0.01, def: 0.5,  fmt: 2 },
  { id: 'vignette',    group: '后处理', label: '暗角',        min: 0,   max: 1, step: 0.01, def: 0.4,  fmt: 2 },
  { id: 'grain',       group: '后处理', label: '胶片颗粒',    min: 0,   max: 1, step: 0.01, def: 0.2,  fmt: 2 },
  // ---- 相机 / 时间 ----
  { id: 'timeScale',   group: '相机 / 时间', label: '时间流速',   min: 0, max: 3, step: 0.01, def: 1, fmt: 2 },
  { id: 'camSpeed',    group: '相机 / 时间', label: '电影镜头速度', min: 0, max: 3, step: 0.01, def: 1, fmt: 2 },
];

export const PARAM_DEFAULTS = Object.fromEntries(PARAMS.map(p => [p.id, p.def]));

// 质量档：renderScale 相对 (cssSize × min(dpr, dprCap))
export const QUALITY = {
  standard:  { label: 'Standard',  steps: 144, renderScale: 0.80, dprCap: 1.5, bloomLevels: 5, maxCrossings: 3 },
  high:      { label: 'High',      steps: 208, renderScale: 1.00, dprCap: 2.0, bloomLevels: 5, maxCrossings: 3 },
  cinematic: { label: 'Cinematic', steps: 320, renderScale: 1.00, dprCap: 2.0, bloomLevels: 6, maxCrossings: 4 },
};

// 视角预设：球坐标 (半径, 极角°(自+y轴), 方位角°)
export const VIEWS = {
  edge:  { label: '侧视边缘', radius: 20, polar: 84, azimuth: 0,   fov: 45 },
  top:   { label: '俯视',     radius: 26, polar: 18, azimuth: 35,  fov: 45 },
  close: { label: '光子环',   radius: 10, polar: 76, azimuth: 160, fov: 50 },
  wide:  { label: '远景',     radius: 36, polar: 62, azimuth: 300, fov: 42 },
};

export const DEBUG_VIEWS = [
  '最终渲染',        // 0
  '积分步数',        // 1
  '最近接近距离',    // 2
  '逃逸方向',        // 3
  '盘面穿越次数',    // 4
  '首次命中半径',    // 5
  'Doppler 因子',    // 6
  '总频移 g',        // 7
  '原始 HDR',        // 8
  '仅 Bloom',        // 9
];

export const STORAGE_KEY = 'gargantua.state.v4';

// 物理常数（几何单位 G=c=M=1）：视界 r=2，光子球 r=3，ISCO r=6
export const PHYS = {
  HORIZON: 2.0,
  PHOTON_SPHERE: 3.0,
  ESCAPE_R: 60.0,
  MAX_STEPS: 320, // 着色器编译期循环上限
};
