# GARGANTUA — Schwarzschild Black Hole Raytracer

全屏交互式黑洞实时光线追踪。主体由**单个全屏 Fragment Shader 实时积分 Schwarzschild 零测地线**完成：
事件视界、光子环、吸积盘多次穿越成像、引力透镜、Doppler 增亮、引力红移、程序化星空与银河、动态盘面湍流，均为逐像素物理解算 —— 无黑球、无平面圆环、无贴图、无视频。

## 启动

无需构建。任意静态服务器指向本目录即可：

```bash
cd gargantua
python3 -m http.server 8080
# 或
npx serve .
```

浏览器打开 `http://localhost:8080/`（需 WebGL2；Chrome / Edge / Firefox / Safari 16+）。

> 必须通过 HTTP 访问（ES Modules 不支持 file:// 直开）。

## 物理模型

- 几何单位 G=c=M=1：事件视界 r=2，光子球 r=3，ISCO r=6。
- 零测地线以直角坐标形式 RK4 积分：`d²x/dλ² = −3 h² x / r⁵`（h² 守恒比角动量），与 Binet 方程 `u″ + u = 3u²` 严格等价；步长随视界距离自适应加密。
- 吸积盘：赤道面薄盘，每像素最多 3–4 次穿越前向 alpha 累积（产生上部/下部高阶像）。
- 盘发射：Page–Thorne 轮廓 r^(−3/4) 温度、Kepler 共转 fbm 湍流、黑体近似、玻尔兹曼辐射权重。
- 相对论效应：圆轨道局部速度 v=1/√(r−2) 的相对论 Doppler 因子 g_D（Iν∝g³）、引力红移 g=√(1−2/r)。
- 未被捕获且逃逸的光线采样程序化天球（恒星 3×3×3 邻域哈希 + 银河 fbm 带），引力透镜自然成立。

## 操作

| 按键 | 功能 |
|---|---|
| Space | 电影镜头循环开/关（拖拽可随时接管） |
| F1–F4 | 视角预设：侧视边缘 / 俯视 / 光子环 / 远景 |
| C | 循环切换视角预设 |
| 0–9 | 调试视图（0=最终；1 步数、2 最近接近、3 逃逸方向、4 穿越次数、5 命中半径、6 Doppler、7 总频移、8 原始 HDR、9 仅 Bloom） |
| U | 参数面板（21 项实时参数） |
| L | 质量档 Standard / High / Cinematic |
| M | 氛围音乐（缺失音频时自动回退 WebAudio 合成和声） |
| P | 导出 PNG 截图 |
| R | 重置参数 |
| H | 隐藏/显示 HUD |

鼠标/触屏：拖拽环绕、滚轮缩放（OrbitControls）。

## URL 自动化接口

```
/?view=edge|top|close|wide      视角
&quality=standard|high|cinematic 质量档
&debug=0..9                     调试视图
&cinematic=0|1                  电影镜头
&hud=0|1                        HUD 显隐
&t=<秒>                         电影镜头时间快进
&params=<urlencode(JSON)>       覆盖任意参数，如 {"diskTemp":0.8}
&autoshot=1&shotdelay=1200&shotname=x.png  自动截图：延迟后下载 PNG，
                                  并置 window.__SHOT_READY=true、title 加 [SHOT_READY]
```

页面钩子：`window.GARGANTUA = { setParam, setView, setQuality, setDebug, setCinematic, capture(), stats() }`；
`window.__GARG_READY` 启动完成置真；`window.__GARG_ERRORS` 收集全部运行时错误（验收应为空）。

## 工程特性

- 三质量档：步数 144 / 208 / 320，渲染分辨率与 DPR 上限分档；移动端默认 Standard。
- Retina：按 devicePixelRatio × 档位缩放；窗口 resize 自动重建渲染目标。
- 状态持久化：参数、质量、视角、音乐等保存 localStorage，刷新自动恢复。
- WebGL 错误恢复：监听 contextlost / contextrestored，丢失时显示遮罩并在恢复后自动重建（状态已从存档恢复）；启动时检测 WebGL2 / EXT_color_buffer_float，缺失时降级 LDR 或给出明确错误页。
- HDR 管线：HalfFloat 场景目标 → 亮部提取 → 5–6 级下采样 + 可分离高斯 → ACES、径向色散、暗角、动态胶片颗粒、sRGB 编码。

## 目录

```
index.html            入口（importmap → 本地 vendor）
css/style.css         HUD 样式
js/config.js          21 项参数定义、质量档、视角预设
js/shaders.js         测地线积分 + 后处理全部 GLSL
js/raytracer.js       全屏通道与光线追踪通道
js/post.js            HDR Bloom 管线
js/camera.js          电影镜头 / OrbitControls / 预设过渡
js/ui.js              HUD 与参数面板
js/audio.js           氛围音乐 + WebAudio 回退
js/main.js            启动、渲染循环、快捷键、URL 接口、持久化、错误恢复
vendor/               three.module.js r160 + OrbitControls（本地化，无 CDN 依赖）
assets/ambient.mp3    AI 生成的深空氛围音乐
```
