import { Link } from 'react-router-dom'
import { Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center glass-card p-8 neon-border"
      >
        <Terminal className="w-10 h-10 text-cyber-cyan mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gradient mb-2">404</h1>
        <p className="text-cyber-grid text-sm mb-6">你访问的页面不存在或已被移除。</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 text-xs font-mono border border-cyber-cyan/60 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors rounded"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  )
}
