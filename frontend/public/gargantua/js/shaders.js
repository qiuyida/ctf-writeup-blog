// GARGANTUA — 全部 GLSL 着色器源码
// 物理：几何单位 G=c=M=1。事件视界 r=2，光子球 r=3，ISCO r=6。
// 零测地线以直角坐标形式积分：d²x/dλ² = -3 h² x / r⁵（h² 为比角动量平方，守恒），
// 与 Binet 方程 u'' + u = 3u²（u=1/r）严格等价。

export const QUAD_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const RAYTRACE_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;

uniform vec2  uRes;
uniform vec3  uCamPos, uCamRight, uCamUp, uCamFwd;
uniform float uTanFov, uAspect;
uniform float uTime;
uniform int   uSteps;        // 实际积分步数 (<= MAX_STEPS)
uniform int   uCrossings;    // 允许的最大盘面穿越次数
uniform int   uDebug;        // 0..7（8/9 由后处理呈现）
uniform float uStepMul;
uniform float uDiskIn, uDiskOut, uDiskTemp, uDiskBright, uTurb, uTurbSpeed, uSpiral;
uniform float uDoppler, uRedshift;
uniform float uStarDensity, uMilky;

#define MAX_STEPS 320
#define HORIZON 2.0
#define ESCAPE_R 40.0
#define PI 3.14159265359

// ---------- hash / noise ----------
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),
        mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
        mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.13 + vec3(17.7, 9.2, 4.1);
    a *= 0.5;
  }
  return v;
}

// ---------- 黑体辐射近似（Tanner Helland, T 单位 10000K） ----------
vec3 blackbody(float t) {
  float T = clamp(t, 0.12, 4.4) * 10000.0;
  float x = T / 100.0;
  vec3 c;
  c.r = (T <= 6600.0) ? 1.0 : clamp(1.292936 * pow(x - 60.0, -0.1332047), 0.0, 1.0);
  c.g = (T <= 6600.0) ? clamp((99.470803 * log(x) - 161.119568) / 255.0, 0.0, 1.0)
                      : clamp(1.129891 * pow(x - 60.0, -0.0755148), 0.0, 1.0);
  if (T >= 6600.0) c.b = 1.0;
  else if (T <= 1900.0) c.b = 0.0;
  else c.b = clamp((138.517731 * log(x - 10.0) - 305.044793) / 255.0, 0.0, 1.0);
  return c;
}

// ---------- 程序化星空 + 银河 ----------
vec3 starLayer(vec3 dir, float scale, float thresh, float bright) {
  // 3×3×3 邻域采样，避免单元边界裁剪
  vec3 col = vec3(0.0);
  vec3 base = floor(dir * scale);
  for (int i = -1; i <= 1; i++)
  for (int j = -1; j <= 1; j++)
  for (int k = -1; k <= 1; k++) {
    vec3 cell = base + vec3(float(i), float(j), float(k));
    float h = hash13(cell);
    if (h < thresh) continue;
    vec3 jitter = hash33(cell + 7.7) - 0.5;
    vec3 starDir = normalize(cell + 0.5 + jitter * 0.85);
    float d = length(dir - starDir) * scale;
    float core = smoothstep(0.55, 0.02, d);
    float lum = pow((h - thresh) / (1.0 - thresh), 6.0) * bright;
    // 恒星色温：偏白蓝 ~ 偏橙
    vec3 tint = mix(vec3(1.0, 0.72, 0.45), vec3(0.75, 0.85, 1.0), hash13(cell + 3.3));
    col += tint * core * lum;
  }
  return col;
}

vec3 skyColor(vec3 dir) {
  vec3 col = vec3(0.0);
  if (uStarDensity > 0.001) {
    col += starLayer(dir, 42.0, 1.0 - 0.016 * uStarDensity, 3.4);
    col += starLayer(dir, 95.0, 1.0 - 0.011 * uStarDensity, 1.5);
  }
  if (uMilky > 0.001) {
    // 倾斜银道面
    vec3 n = normalize(vec3(0.42, 1.0, 0.28));
    float band = exp(-pow(abs(dot(dir, n)) * 3.4, 1.6));
    float wisp = fbm(dir * 2.6 + vec3(4.2, 1.3, 8.8));
    float wisp2 = fbm(dir * 6.5 + vec3(9.1, 3.7, 2.2));
    float m = band * (0.30 + 0.85 * wisp) * (0.55 + 0.65 * wisp2);
    vec3 mwCol = mix(vec3(0.36, 0.42, 0.62), vec3(0.95, 0.78, 0.55), wisp * 0.8);
    col += mwCol * m * 0.22 * uMilky;
    // 银心暗尘埃带
    float dust = band * smoothstep(0.45, 0.75, fbm(dir * 4.0 + vec3(1.0, 9.0, 3.0)));
    col *= 1.0 - dust * 0.35 * uMilky;
  }
  return col;
}

// ---------- 测地线加速度：a = -3 h² x / r⁵ ----------
vec3 geoAccel(vec3 x, float h2) {
  float r2 = dot(x, x);
  float inv = 1.0 / (r2 * r2 * sqrt(r2)); // r^-5
  return -3.0 * h2 * x * inv;
}

// ---------- 吸积盘着色（薄盘，赤道面 y=0） ----------
// 返回 rgb=发射色, a=覆盖率；同时输出频移因子
vec4 diskShade(vec3 p, vec3 photonDir, out float gDop, out float gTot) {
  float r = length(p);
  float phi = atan(p.z, p.x);

  // 共转坐标系中的湍流：Kepler 角速度 Ω = r^-3/2
  float omega = pow(r, -1.5);
  float ang = phi - uTime * uTurbSpeed * omega * 6.0 + uSpiral * log(r / uDiskIn);
  vec3 np = vec3(cos(ang), sin(ang), 0.0) * (1.6 + r * 0.30);
  np.z = r * 0.22 - uTime * 0.03;
  float n1 = fbm(np);
  float n2 = fbm(np * 2.7 + vec3(3.1, 8.7, 1.9));
  float turb = mix(1.0, clamp(n1 * 1.25 + n2 * 0.55, 0.0, 1.6), uTurb * 0.62);

  // 径向发射轮廓：内缘锐增、外缘陡降（发射集中于内缘，保留结构对比）
  float inner = smoothstep(uDiskIn, uDiskIn + 0.35, r);
  float outer = 1.0 - smoothstep(uDiskOut * 0.45, uDiskOut, r);
  float prof = pow(uDiskIn / r, 2.6) * inner * outer;
  float dens = prof * pow(turb, 2.0);

  // 温度：T ∝ r^-3/4（Page–Thorne 轮廓的远区近似）
  float temp = uDiskTemp * 1.35 * pow(uDiskIn / r, 0.75);

  // 圆轨道局部物理速度 v = 1/sqrt(r-2)（静态观察者系）
  float beta = inversesqrt(max(r - HORIZON, 0.05));
  float gamma = inversesqrt(max(1.0 - beta * beta, 0.02));
  vec3 tangent = normalize(vec3(-p.z, 0.0, p.x));
  float approaching = dot(tangent, photonDir);
  // 相对论 Doppler 因子
  gDop = 1.0 / (gamma * (1.0 - beta * approaching));
  // 引力红移
  float gGrav = sqrt(max(1.0 - HORIZON / r, 0.0));
  float g = mix(1.0, gDop, uDoppler) * mix(1.0, gGrav, uRedshift);
  gTot = g;

  float g3 = g * g * g; // 比强度 Iν/ν³ 不变量 → Iν ∝ g³
  // 玻尔兹曼式辐射权重：外冷内热，形成真实径向亮度梯度
  float bolom = pow(clamp(temp * g / (uDiskTemp * 1.35), 0.0, 1.6), 1.2);
  vec3 col = blackbody(temp * g) * dens * g3 * bolom * uDiskBright * 1.6;
  float alpha = clamp(dens * 1.7, 0.0, 1.0);
  return vec4(col, alpha);
}

// turbo 近似色带（调试视图用）
vec3 turbo(float t) {
  t = clamp(t, 0.0, 1.0);
  return clamp(vec3(
    1.5 * t - 0.15,
    1.5 - abs(2.6 * t - 1.3),
    1.3 - 1.6 * t), 0.0, 1.0);
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamFwd + uTanFov * (ndc.x * uAspect * uCamRight + ndc.y * uCamUp));

  vec3 x = ro;
  vec3 v = rd; // 远处平直时空，|v|≈1
  float h2 = dot(cross(x, v), cross(x, v)); // 守恒比角动量平方

  vec3 col = vec3(0.0);
  float transmit = 1.0;   // 剩余透射率
  int crossings = 0;
  float minR = 1e9;
  float stepsUsed = 0.0;
  float firstHitR = -1.0;
  float gDop = 1.0, gTot = 1.0;
  bool escaped = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    if (i >= uSteps) break;
    float r = length(x);
    minR = min(minR, r);

    // 距离自适应步长：近光子球加密，远场放宽
    float dt = uStepMul * 0.22 * max(r - 1.85, 0.04);
    dt = clamp(dt, 0.008, 1.0);

    // RK4 积分一步
    vec3 k1x = v;
    vec3 k1v = geoAccel(x, h2);
    vec3 k2x = v + 0.5 * dt * k1v;
    vec3 k2v = geoAccel(x + 0.5 * dt * k1x, h2);
    vec3 k3x = v + 0.5 * dt * k2v;
    vec3 k3v = geoAccel(x + 0.5 * dt * k2x, h2);
    vec3 k4x = v + dt * k3v;
    vec3 k4v = geoAccel(x + dt * k3x, h2);
    vec3 nx = x + dt * (k1x + 2.0 * k2x + 2.0 * k3x + k4x) / 6.0;
    vec3 nv = v + dt * (k1v + 2.0 * k2v + 2.0 * k3v + k4v) / 6.0;

    // 盘面穿越检测（赤道面符号翻转，前 N% 段忽略以防相机在盘内）
    if (crossings < uCrossings && transmit > 0.01 && x.y * nx.y < 0.0) {
      float f = x.y / (x.y - nx.y);
      if (f > 0.02) {
        vec3 p = mix(x, nx, f);
        float pr = length(p);
        if (pr > uDiskIn && pr < uDiskOut) {
          float gd, gt;
          vec4 dsk = diskShade(p, normalize(mix(v, nv, f)), gd, gt);
          col += transmit * dsk.rgb * dsk.a;
          transmit *= 1.0 - dsk.a;
          if (firstHitR < 0.0) firstHitR = pr;
          gDop = gd; gTot = gt;
          crossings++;
        }
      }
    }

    x = nx; v = nv;
    stepsUsed = float(i) + 1.0;
    float nr = length(x);
    minR = min(minR, nr);

    if (nr < HORIZON * 0.995) break; // 落入视界
    if (nr > ESCAPE_R && dot(x, v) > 0.0) { escaped = true; break; }
  }

  // 仅当光线明确逃逸到远场才采样背景天球（引力透镜自动成立：v 已被弯曲）。
  // 步数耗尽但已远离视界且明显外逃者按逃逸处理；困于光子球附近者保持为黑。
  if (!escaped && length(x) > 10.0 && dot(normalize(x), normalize(v)) > 0.3) {
    escaped = true;
  }
  if (escaped && transmit > 0.01) {
    col += transmit * skyColor(normalize(v));
  } else if (transmit > 0.01) {
    // 步数耗尽但未曾深入光子球者终将逃逸（强延迟/红移）—— 以暗淡天光填充，
    // 避免高阶像临界曲线出现死黑接缝
    float fill = smoothstep(3.0, 3.4, minR) * 0.4;
    if (fill > 0.0) col += transmit * skyColor(normalize(v)) * fill;
  }

  // ---------- 调试视图 ----------
  if (uDebug == 1) {
    col = turbo(stepsUsed / float(uSteps));
  } else if (uDebug == 2) {
    col = turbo(clamp((minR - HORIZON) / 14.0, 0.0, 1.0));
  } else if (uDebug == 3) {
    col = escaped ? normalize(v) * 0.5 + 0.5 : vec3(0.0);
  } else if (uDebug == 4) {
    col = turbo(float(crossings) / 4.0);
  } else if (uDebug == 5) {
    col = firstHitR < 0.0 ? vec3(0.0) : turbo(clamp((firstHitR - uDiskIn) / max(uDiskOut - uDiskIn, 0.01), 0.0, 1.0));
  } else if (uDebug == 6) {
    float d = clamp((gDop - 1.0) * 1.2, -1.0, 1.0);
    col = vec3(max(d, 0.0), 0.12, max(-d, 0.0)) * 2.0;
  } else if (uDebug == 7) {
    col = turbo(clamp(gTot / 2.4, 0.0, 1.0));
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------- Bloom：亮部提取 ----------
export const BRIGHT_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform float uThresh;
void main() {
  vec3 c = texture2D(tSrc, vUv).rgb;
  float l = max(max(c.r, c.g), c.b);
  float k = max(l - uThresh, 0.0) / max(l, 1e-4);
  gl_FragColor = vec4(c * k, 1.0);
}
`;

// ---------- Bloom：下采样（4-tap Kawase） ----------
export const DOWN_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform vec2 uTexel;
void main() {
  vec3 c = texture2D(tSrc, vUv + uTexel * vec2( 1.0,  1.0)).rgb
         + texture2D(tSrc, vUv + uTexel * vec2(-1.0,  1.0)).rgb
         + texture2D(tSrc, vUv + uTexel * vec2( 1.0, -1.0)).rgb
         + texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  gl_FragColor = vec4(c * 0.25, 1.0);
}
`;

// ---------- Bloom：可分离高斯模糊 ----------
export const BLUR_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform vec2 uDir;   // (1,0) 或 (0,1)
uniform vec2 uTexel;
void main() {
  vec3 c = texture2D(tSrc, vUv).rgb * 0.227027;
  vec2 o1 = uDir * uTexel * 1.3846154;
  vec2 o2 = uDir * uTexel * 3.2307692;
  c += texture2D(tSrc, vUv + o1).rgb * 0.3162162;
  c += texture2D(tSrc, vUv - o1).rgb * 0.3162162;
  c += texture2D(tSrc, vUv + o2).rgb * 0.0702703;
  c += texture2D(tSrc, vUv - o2).rgb * 0.0702703;
  gl_FragColor = vec4(c, 1.0);
}
`;

// ---------- 合成：CA + Bloom + 曝光 + ACES + 暗角 + 颗粒 ----------
export const COMPOSITE_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tScene;
uniform sampler2D tB0, tB1, tB2, tB3, tB4, tB5;
uniform float uBloomInt, uExposure, uChroma, uVignette, uGrain, uTime;
uniform int uBloomLevels;
uniform int uMode; // 0=最终 1=原始HDR 2=仅Bloom

vec3 bloomSum(vec2 uv) {
  vec3 b = vec3(0.0);
  b += texture2D(tB0, uv).rgb * 0.34;
  b += texture2D(tB1, uv).rgb * 0.26;
  b += texture2D(tB2, uv).rgb * 0.18;
  if (uBloomLevels > 3) b += texture2D(tB3, uv).rgb * 0.12;
  if (uBloomLevels > 4) b += texture2D(tB4, uv).rgb * 0.08;
  if (uBloomLevels > 5) b += texture2D(tB5, uv).rgb * 0.05;
  return b;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

float ghash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 cc = uv - 0.5;
  float r2 = dot(cc, cc);

  vec3 c;
  vec3 bloom = bloomSum(uv);

  if (uMode == 2) {
    c = bloom * uBloomInt;
  } else if (uMode == 1) {
    c = texture2D(tScene, uv).rgb; // 原始 HDR，Reinhard 预览
    c = c / (1.0 + c);
    gl_FragColor = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
    return;
  } else {
    // 径向色散：RGB 三通道微量偏移采样
    float ca = uChroma * 0.0018 * r2 * 4.0;
    vec3 scene;
    scene.r = texture2D(tScene, uv + cc * ca).r;
    scene.g = texture2D(tScene, uv).g;
    scene.b = texture2D(tScene, uv - cc * ca).b;
    c = scene + bloom * uBloomInt;
  }

  c *= uExposure;
  c = aces(c);

  // 暗角
  c *= 1.0 - uVignette * smoothstep(0.15, 0.62, r2);

  // 动态胶片颗粒（暗部加权）
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float g = ghash(gl_FragCoord.xy + fract(uTime * 13.7) * 311.0) * 2.0 - 1.0;
  c += g * uGrain * 0.045 * (1.0 - lum * 0.7);

  c = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); // sRGB 近似编码
  gl_FragColor = vec4(c, 1.0);
}
`;
