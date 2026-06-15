import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Flag, Terminal, Shield, Code, Zap, ArrowRight, ChevronDown, Filter } from 'lucide-react'
import { lazy, Suspense, useEffect, useState, useRef } from 'react'
import { allChallenges } from '../data/challenges.js'

// 懒加载粒子库 - 减少首屏加载时间
const Particles = lazy(() => import('@tsparticles/react'))
const tsparticles = import('tsparticles').then(m => m.loadFull)

// Sakura petal colors (soft pink tones)
const SAKURA_COLORS = [
  'rgba(255, 183, 197, 0.75)',
  'rgba(255, 212, 221, 0.7)',
  'rgba(248, 180, 195, 0.8)',
  'rgba(255, 220, 228, 0.65)',
]

function Sakura() {
  const [petals, setPetals] = useState([])

  useEffect(() => {
    const count = window.innerWidth < 640 ? 10 : 22
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 12 + 8,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * -15,
      color: SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)],
      opacity: Math.random() * 0.4 + 0.3,
      sway: Math.random() > 0.5,
    }))
    setPetals(generated)
  }, [])

  return (
    <div className="sakura-container">
      {petals.map((p) => (
        <div
          key={p.id}
          className="sakura-petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationName: p.sway ? 'sakura-sway, sakura-fall' : 'sakura-fall',
          }}
        />
      ))}
    </div>
  )
}

// Static color map for inline styles (Tailwind JIT can't resolve dynamic class names)
const CYBER_COLORS = {
  cyan: '#00f5ff',
  blue: '#60a5fa',
  purple: '#a78bfa',
  pink: '#f472b6',
}

const categories = [
  { id: 'qingcen-web-2026-06-10', title: '青岑 CTF Web 入门', subtitle: '2026-06-10 | 17/20 题', icon: Flag, desc: 'HTML注释/Base64/隐藏字段/响应头/robots.txt/PHP弱类型', color: 'cyan' },
  { id: 'may-2026', title: 'CTF Writeup - May 2026', subtitle: 'ISCC/青岑/CTFShow', icon: Flag, desc: 'ISCC JWT伪造 + 青岑120题全通关 + CTFShow基础', color: 'cyan' },
  { id: 'tools', title: 'CTF Tools', subtitle: '工具使用指南', icon: Zap, desc: 'IDA, Burp Suite, GDB, Pwntools 等工具教程', color: 'purple' },
  { id: 'infoleak', title: 'Information Leakage', subtitle: '信息收集', icon: Shield, desc: 'HTML注释/响应头/备份文件/Cookie/JWT', color: 'cyan' },
  { id: 'php', title: 'PHP Weak Typing', subtitle: '弱类型绕过', icon: Code, desc: 'Array bypass, 0e MD5, array_search', color: 'purple' },
  { id: 'cmd', title: 'Command Injection', subtitle: '命令注入RCE', icon: Terminal, desc: 'IFS bypass, 无字母RCE, 字符串拼接', color: 'pink' },
  { id: 'pwn', title: 'PWN & Reverse', subtitle: '二进制利用', icon: Flag, desc: 'XOR解密, 逆向, Shellcode编写', color: 'blue' },
  { id: 'stego', title: 'Steganography', subtitle: '隐写术', icon: Code, desc: '零宽字符, EXIF隐写, ZIP密码破解', color: 'purple' },
  { id: 'misc', title: 'Miscellaneous', subtitle: '杂项综合', icon: Shield, desc: 'LFI, SSRF, 变量覆盖, CTFHub彩蛋', color: 'cyan' }
]

const particlesInit = async (engine) => {
  const loadFull = await tsparticles
  await loadFull(engine)
}

const particlesConfig = {
  fullScreen: false,
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      onClick: { enable: true, mode: 'push' },
      resize: true
    },
    modes: {
      grab: { distance: 140, links: { opacity: 0.5 } },
      push: { quantity: 4 }
    }
  },
  particles: {
    color: { value: ['#00f5ff', '#8000ff', '#ff00ff'] },
    links: {
      color: '#00f5ff',
      distance: 150,
      enable: true,
      opacity: 0.2,
      width: 1
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'bounce' }
    },
    number: { density: { enable: true, area: 800 }, value: 60 },
    opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 3 } }
  },
  detectRetina: true
}

function MouseTrail() {
  const canvasRef = useRef(null)
  const isMobile = useRef(window.innerWidth < 640)

  useEffect(() => {
    if (isMobile.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    const trails = [];
    const maxTrails = 30;

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)

    const onMove = (e) => {
      const colors = ['#00f5ff', '#8000ff', '#ff00ff', '#00ff88']
      trails.push({
        x: e.clientX, y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        size: Math.random() * 4 + 2
      })
      if (trails.length > maxTrails) trails.shift()
    }
    window.addEventListener('mousemove', onMove)

    let animId
    let paused = false
    const onVisibility = () => { paused = document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    const animate = () => {
      if (paused) { animId = requestAnimationFrame(animate); return }
      ctx.clearRect(0, 0, w, h)
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i]
        t.life -= 0.025
        if (t.life <= 0) { trails.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2)
        ctx.fillStyle = t.color + Math.round(t.life * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(animId)
    }
  }, [])

  // 移动端不渲染canvas
  if (isMobile.current) return null
  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" />
}

// 黑幕遮挡组件 - 萌娘百科风格
function Spoiler({ children, className = '' }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setShowTooltip(false)
  }

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative cursor-pointer select-none
          ${isHovered ? 'text-yellow-400' : 'text-transparent'}
          ${className}
        `}
        style={{
          backgroundColor: isHovered ? 'transparent' : '#000',
          borderRadius: '4px',
          padding: '2px 8px',
          minWidth: '40px',
          display: 'inline-block',
          transition: 'all 0.15s ease',
          boxShadow: isHovered ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.3)'
        }}
      >
        {/* 黑幕遮挡层 */}
        {!isHovered && (
          <span 
            className="absolute inset-0 bg-[#0a0a0a]"
            style={{ borderRadius: '4px' }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </span>
      
      {/* 提示框 */}
      <AnimatePresence>
        {showTooltip && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none"
          >
            <span className="inline-block bg-black border border-red-500 rounded px-3 py-1.5 text-red-500 text-xs font-bold whitespace-nowrap">
              你知道的太多了
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

const platformNames = {
  all: { label: '全部', color: 'cyan' },
  ctfshow: { label: 'CTFShow', color: 'blue' },
  qc: { label: 'QC 青岑', color: 'purple' }
}

export default function Home({ GlitchText, TypewriterText }) {
  const [typedDone, setTypedDone] = useState(false)
  const [loopKey, setLoopKey] = useState(0)
  const [platform, setPlatform] = useState('all')
  
  const filtered = platform === 'all' ? allChallenges : allChallenges.filter(c => c.platform === platform)
  const solved = filtered.filter(c => c.solved).length
  const firstBloods = filtered.filter(c => c.firstBlood).length
  const totalPts = filtered.reduce((s, c) => s + c.points, 0)
  const platformName = platform === 'all' ? '' : platformNames[platform].label
  const subtitle = `{ ${solved} challenges solved, ${totalPts}pts }${platformName ? ' [' + platformName + ']' : ''}`

  // When typewriter finishes, wait 3s then loop
  useEffect(() => {
    if (!typedDone) return
    const t = setTimeout(() => {
      setTypedDone(false)
      setLoopKey(k => k + 1)
    }, 3000)
    return () => clearTimeout(t)
  }, [typedDone])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mouse Trail */}
      <MouseTrail />

      {/* Particle Background - 懒加载 */}
      <Suspense fallback={null}>
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesConfig}
          className="absolute inset-0 z-0"
        />
      </Suspense>

      {/* Sakura Petals */}
      <Sakura />

      {/* Circuit Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 L30 50 L50 30 L50 0" fill="none" stroke="#00f5ff" strokeWidth="0.5"/>
              <path d="M100 50 L70 50 L50 70 L50 100" fill="none" stroke="#8000ff" strokeWidth="0.5"/>
              <circle cx="50" cy="50" r="2" fill="#00f5ff"/>
              <circle cx="30" cy="50" r="1" fill="#8000ff"/>
              <circle cx="70" cy="50" r="1" fill="#ff00ff"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 md:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mb-4">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-cyber-purple/70 text-sm font-mono tracking-widest"
              >
                MISSION_BRIEFING
              </motion.span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 anime-title">
              <GlitchText text="CTF WriteUp" className="text-gradient cyber-glow" as="div" />
              <br />
              <span className="text-cyber-cyan/80 text-xl sm:text-2xl md:text-3xl">Web Security Writeups</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-cyber-grid text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 font-mono"
            >
              {typedDone ? <span>{subtitle}</span> : <TypewriterText key={loopKey} text={subtitle} speed={35} onDone={() => setTypedDone(true)} />}
            </motion.p>

            {/* Platform Filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2 mb-6"
            >
              <Filter className="w-4 h-4 text-cyber-grid/50" />
              {Object.entries(platformNames).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPlatform(key)}
                  className="px-3 py-1 text-xs font-mono rounded transition-all border"
                  style={platform === key
                    ? { backgroundColor: CYBER_COLORS[val.color] + '33', color: CYBER_COLORS[val.color], borderColor: CYBER_COLORS[val.color] + '80' }
                    : { color: 'rgba(138,154,190,0.4)', borderColor: 'transparent' }
                  }
                >
                  {val.label}
                </button>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8 sm:mb-12"
            >
              {[
                { label: '已解', value: solved, suffix: '题' },
                { label: '分类', value: new Set(filtered.map(c => c.category)).size, suffix: '' },
                { label: '总分', value: totalPts, suffix: 'pts' },
                { label: '一血', value: firstBloods, suffix: '' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="glass-card p-3 sm:p-4 neon-border"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient">
                    {stat.value}
                    <span className="text-sm text-cyber-cyan/80">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-cyber-grid mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/challenges">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-blue text-cyber-darker font-bold rounded-lg flex items-center gap-2 animate-glow"
                >
                  <Flag className="w-5 h-5" />
                  View Challenges
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
            {/* 黑幕彩蛋 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 text-sm text-cyber-grid/60 font-mono"
            >
              试试把鼠标悬停在 <Spoiler>flag</Spoiler>、<Spoiler>一血</Spoiler>、<Spoiler>RCE</Spoiler>、<Spoiler>JWT伪造</Spoiler> 这些词上~
            </motion.p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-cyber-cyan/80" />
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-cyber-purple/70 text-sm font-mono tracking-widest">
              CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 anime-title text-gradient">
              Challenge Categories
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/article/${cat.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="glass-card p-4 sm:p-6 h-full cursor-pointer group neon-border-hover"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                        style={{ backgroundColor: CYBER_COLORS[cat.color] + '1a' }}>
                        <cat.icon className="w-6 h-6" style={{ color: CYBER_COLORS[cat.color] }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-cyber-cyan group-hover:text-white transition-colors anime-title">
                            {cat.title}
                          </h3>
                          <span className="text-xs text-cyber-grid font-mono">
                            {allChallenges.filter(c => c.category === cat.id).length || ''}
                          </span>
                        </div>
                        <p className="text-sm text-cyber-grid mb-2">{cat.subtitle}</p>
                        <p className="text-xs text-cyber-cyan/80 line-clamp-2">{cat.desc}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-cyber-cyan/70 group-hover:text-cyber-cyan transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Writeups - 一血题目 */}
      <section className="py-12 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-cyber-pink/70 text-sm font-mono tracking-widest">
              FIRST BLOOD
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 anime-title text-gradient">
              🩸 精选一血 Writeups
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {allChallenges.filter(c => c.firstBlood).map((challenge, i) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/article/${challenge.category}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="glass-card p-4 sm:p-5 h-full cursor-pointer group neon-border-hover"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 text-xs font-mono rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        🩸 FIRST BLOOD
                      </span>
                      <span className="text-xs text-cyber-grid font-mono">
                        {challenge.points}pts
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-cyber-cyan group-hover:text-white transition-colors mb-2">
                      {challenge.name}
                    </h3>
                    <p className="text-sm text-cyber-grid mb-3">
                      {challenge.method}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cyber-purple/70 font-mono">
                        {challenge.platform === 'qc' ? 'QC 青岑' : 'CTFShow'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-cyber-cyan/50 group-hover:text-cyber-cyan transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts - 最新文章 */}
      <section className="py-12 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-cyber-cyan/70 text-sm font-mono tracking-widest">
              LATEST
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 anime-title text-gradient">
              📝 最新 Writeups
            </h2>
          </motion.div>

          <div className="space-y-4">
            {categories.slice(0, 5).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/article/${cat.id}`}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="glass-card p-4 sm:p-5 cursor-pointer group neon-border-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: CYBER_COLORS[cat.color] + '1a' }}>
                        <cat.icon className="w-5 h-5" style={{ color: CYBER_COLORS[cat.color] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-cyber-cyan group-hover:text-white transition-colors truncate">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-cyber-grid truncate">{cat.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-cyber-grid font-mono">
                          {allChallenges.filter(c => c.category === cat.id).length} 题
                        </span>
                        <ArrowRight className="w-4 h-4 text-cyber-cyan/50 group-hover:text-cyber-cyan transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-12 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-5 sm:p-8 neon-border"
          >
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-cyber-cyan" />
              <span className="text-cyber-purple/70 text-sm font-mono tracking-widest">
                INTRO
              </span>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-cyber-cyan/80 text-lg leading-relaxed mb-4">
                CTF is not as far as you think. When you first started in web security, you might have felt confused and overwhelmed. But the real journey begins when you actually start solving challenges — it is a skill that requires systematic training.
              </p>
              <p className="text-cyber-grid leading-relaxed mb-4">
                Why CTF? In short, it is the closest training method to real combat. Challenges are often simplifications and abstractions of real vulnerabilities. Through solving them, you experience the loop of "try &rarr; fail &rarr; think &rarr; break through", which is the best way to learn.
              </p>
              <p className="text-cyber-grid leading-relaxed mb-4">
                More importantly, WriteUp documents this journey as a tutorial: it helps you rethink your approach, clarify every step of why you do what you do, rather than relying on intuition to come up with answers. Only when you can clearly articulate the solving process can you truly understand it.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
