import { motion } from 'framer-motion'
import { Mail, Github, ExternalLink } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen relative px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 neon-border"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-4">关于本站</h1>
          <p className="text-cyber-grid text-sm sm:text-base leading-relaxed">
            这是我的 CTF writeup 博客，用于沉淀 Web、PWN、逆向、隐写、杂项等方向的解题思路与踩坑记录。
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://github.com/heliumsenbrg/ctf-writeup-blog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://heliumsenbrg.github.io/ctf-writeup-blog/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              站点链接
            </a>
          </div>
          <p className="mt-4 text-xs text-cyber-grid/70">
            Blog by heliumsenbrg / qiuyida
          </p>
        </motion.div>
      </div>
    </div>
  )
}
