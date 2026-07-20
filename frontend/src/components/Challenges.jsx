import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Flag, CheckCircle, Clock, Zap, Filter, Volume2 } from 'lucide-react'
import { allChallenges } from '../data/challenges.js'

const CYBER_COLORS = {
  cyan: '#00f5ff',
  blue: '#60a5fa',
  purple: '#a78bfa',
  pink: '#f472b6',
}

const platformNames = {
  all: { name: '全部靶场', color: 'cyan' },
  ctfshow: { name: 'CTFShow', color: 'blue' },
  qc: { name: 'QC 青岑', color: 'purple' }
}

const categoryNames = {
  infoleak: { name: '信息收集与泄露', color: 'cyan' },
  php: { name: 'PHP 弱类型', color: 'purple' },
  cmd: { name: '命令注入', color: 'pink' },
  pwn: { name: 'PWN 与逆向', color: 'blue' },
  web: { name: 'Web 练习', color: 'cyan' },
  reverse: { name: '逆向工程', color: 'purple' },
  crypto: { name: '密码学', color: 'pink' },
  stego: { name: '隐写术', color: 'cyan' },
  misc: { name: '杂项', color: 'blue' },
  tools: { name: '工具', color: 'cyan' },
}

// 难度等级 - 基于分数
function getDifficulty(points) {
  if (points < 100) return { label: 'Easy', color: 'green', bg: 'bg-green-900/40', text: 'text-green-400' }
  if (points <= 200) return { label: 'Medium', color: 'yellow', bg: 'bg-yellow-900/40', text: 'text-yellow-400' }
  return { label: 'Hard', color: 'red', bg: 'bg-red-900/40', text: 'text-red-400' }
}

// ===== Victory Jingle =====
// Web Audio API 合成旋律, 无需外部音频文件
function useVictoryJingle() {
  const ctxRef = useRef(null)
  const playedRef = useRef(false)
  const [canPlay, setCanPlay] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  // 等待用户交互以初始化 AudioContext (浏览器自动播放策略)
  useEffect(() => {
    const handler = () => {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
        setCanPlay(true)
      }
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume()
      }
    }
    window.addEventListener('click', handler, { once: true })
    window.addEventListener('keydown', handler, { once: true })
    window.addEventListener('touchstart', handler, { once: true })
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('keydown', handler)
      window.removeEventListener('touchstart', handler)
    }
  }, [])

  const play = useCallback(() => {
    if (playedRef.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    playedRef.current = true
    setHasPlayed(true)

    // ✨ "Never Give Up" 胜利旋律
    // 三段式结构: 希望 → 坚持 → 凯旋
    const notes = [
      { f: 523.25, t: 0.0, d: 0.35 },   // C5
      { f: 587.33, t: 0.35, d: 0.25 },  // D5
      { f: 659.25, t: 0.6, d: 0.35 },   // E5
      { f: 783.99, t: 0.95, d: 0.35 },  // G5
      { f: 1046.5, t: 1.3, d: 0.5 },    // C6
      { f: 880.0, t: 1.8, d: 0.2 },     // A5
      { f: 783.99, t: 2.0, d: 0.2 },    // G5
      { f: 659.25, t: 2.2, d: 0.25 },   // E5
      { f: 783.99, t: 2.45, d: 0.55 },  // G5
      { f: 587.33, t: 3.0, d: 0.2 },    // D5
      { f: 659.25, t: 3.2, d: 0.2 },    // E5
      { f: 783.99, t: 3.4, d: 0.2 },    // G5
      { f: 880.0, t: 3.6, d: 0.2 },     // A5
      { f: 1046.5, t: 3.8, d: 1.2 },    // C6 - 胜利长音
    ]

    const now = ctx.currentTime
    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + t)
      gain.gain.setValueAtTime(0, now + t)
      gain.gain.linearRampToValueAtTime(0.18, now + t + 0.05)
      gain.gain.setValueAtTime(0.15, now + t + d - 0.12)
      gain.gain.linearRampToValueAtTime(0, now + t + d)
      // 微颤音
      const vib = ctx.createOscillator()
      vib.frequency.value = 5
      const vg = ctx.createGain()
      vg.gain.value = 2
      vib.connect(vg)
      vg.connect(osc.frequency)
      vib.start(now + t)
      vib.stop(now + t + d)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + t)
      osc.stop(now + t + d)
    })

    // 背景和弦
    const padNotes = [261.63, 329.63, 392.0, 523.25]
    padNotes.forEach(f => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0.04, now + 0.1)
      gain.gain.setValueAtTime(0.04, now + 3.8)
      gain.gain.linearRampToValueAtTime(0, now + 5.0)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + 0.1)
      osc.stop(now + 5.0)
    })
  }, [])

  return { play, canPlay, played: playedRef, hasPlayed }
}

export default function Challenges() {
  const [platform, setPlatform] = useState('all')
  const { play, canPlay, played, hasPlayed } = useVictoryJingle()

  // 用户首次交互时自动播放
  useEffect(() => {
    if (canPlay && !hasPlayed) {
      const t = setTimeout(() => play(), 600)
      return () => clearTimeout(t)
    }
  }, [canPlay, play, played])

  const filtered = platform === 'all'
    ? allChallenges
    : allChallenges.filter(c => c.platform === platform)

  const grouped = filtered.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {})
  
  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="text-cyber-purple/70 text-sm font-mono tracking-widest">
            ▶ CHALLENGE_LIST
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2 anime-title text-gradient">
            题目列表
          </h1>
          <p className="text-cyber-grid mt-4 font-mono">
            共 <span className="text-cyber-cyan">{filtered.length}</span> 题 | 
            已解 <span className="text-cyber-cyan">{filtered.filter(c => c.solved).length}</span> 题 |
            总分 <span className="text-cyber-cyan">{filtered.reduce((sum, c) => sum + c.points, 0)}</span> pts
          </p>
        </motion.div>

        {/* Platform Filter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          <Filter className="w-4 h-4 text-cyber-grid" />
          {Object.entries(platformNames).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setPlatform(key)}
              className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-xs sm:text-sm font-mono transition-all border"
              style={platform === key
                ? { backgroundColor: CYBER_COLORS[val.color] + '33', color: CYBER_COLORS[val.color], borderColor: CYBER_COLORS[val.color] + '80' }
                : { color: 'rgba(138,154,190,0.6)', borderColor: 'transparent' }
              }
            >
              {val.name}
            </button>
          ))}
        </motion.div>
        
        {/* Challenge categories */}
        {Object.entries(grouped).map(([cat, items], catIndex) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: CYBER_COLORS[categoryNames[cat].color] + '33' }}>
                <Flag className="w-4 h-4" style={{ color: CYBER_COLORS[categoryNames[cat].color] }} />
              </div>
              <h2 className="text-2xl font-bold text-cyber-cyan anime-title">
                {categoryNames[cat].name}
              </h2>
              <span className="text-sm text-cyber-grid font-mono">
                {items.length}题 | {items.reduce((sum, c) => sum + c.points, 0)}pts
              </span>
            </div>
            
            <div className="grid gap-3">
              {items.map((challenge, i) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: catIndex * 0.1 + i * 0.05 }}
                >
                  <Link to={`/article/${cat}`}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="cyber-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          challenge.solved 
                            ? 'bg-cyber-cyan/20 text-cyber-cyan' 
                            : 'bg-cyber-grid/20 text-cyber-grid'
                        }`}>
                          {challenge.solved ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-cyber-cyan group-hover:text-white transition-colors">
                              {challenge.name}
                            </span>
                            {challenge.firstBlood && (
                              <span className="px-2 py-0.5 text-xs bg-cyber-pink/20 text-cyber-pink rounded font-mono animate-pulse">
                                一血
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                              challenge.platform === 'ctfshow'
                                ? 'bg-blue-900/40 text-blue-400'
                                : 'bg-purple-900/40 text-purple-400'
                            }`}>
                              {challenge.platform === 'ctfshow' ? 'CTFShow' : 'QC'}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${getDifficulty(challenge.points).bg} ${getDifficulty(challenge.points).text}`}>
                              {getDifficulty(challenge.points).label}
                            </span>
                          </div>
                          <span className="text-xs text-cyber-grid font-mono">
                            ID: {challenge.id}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:gap-6 pl-14 sm:pl-0">
                        <span className="text-xs sm:text-sm text-cyber-grid">
                          {challenge.method}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-cyber-cyan">
                          {challenge.points}
                          <span className="text-xs text-cyber-grid ml-1">pts</span>
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
        
        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="cyber-card p-5 sm:p-8 mt-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-cyber-cyan" />
            <span className="text-cyber-purple/70 text-sm font-mono">▶ SUMMARY</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-gradient">
                {filtered.filter(c => c.firstBlood).length > 0
                  ? Math.round(filtered.filter(c => c.firstBlood).length / filtered.length * 100)
                  : 0}%
              </div>
              <div className="text-xs text-cyber-grid">一血率</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">{filtered.filter(c => c.solved).length}</div>
              <div className="text-xs text-cyber-grid">已解题数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">{new Set(filtered.map(c => c.category)).size}</div>
              <div className="text-xs text-cyber-grid">分类数量</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">{filtered.filter(c => !c.solved).length}</div>
              <div className="text-xs text-cyber-grid">未解题数</div>
            </div>
          </div>
        </motion.div>

        {/* 🎵 Victory Jingle Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => play()}
            disabled={hasPlayed}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg
              ${canPlay && !hasPlayed
                ? 'bg-gradient-to-r from-cyber-cyan to-cyber-purple animate-pulse cursor-pointer'
                : hasPlayed
                  ? 'bg-cyber-grid/30 cursor-default'
                  : 'bg-cyber-grid/20 border border-cyber-grid/30 cursor-pointer'
              }
              transition-all duration-300`}
            title={hasPlayed ? '已播放 ✓' : canPlay ? '播放胜利旋律!' : '点击页面以激活音乐'}
          >
            <Volume2 className={`w-6 h-6 ${hasPlayed ? 'text-cyber-grid' : 'text-white'}`} />
          </motion.button>
          <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap ${canPlay && !hasPlayed ? 'text-cyber-cyan' : 'text-cyber-grid'}`}>
            {hasPlayed ? '♪ DONE' : canPlay ? '♪ NEVER GIVE UP' : '点击激活'}
          </span>
        </motion.div>
      </div>
    </div>
  )
}
