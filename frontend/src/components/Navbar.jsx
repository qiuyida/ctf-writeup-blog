import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Terminal, Flag, BookOpen, ExternalLink, Menu, X, User, Circle } from 'lucide-react'

const GARGANTUA_URL = `${import.meta.env.BASE_URL}gargantua/index.html`

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-cyber-darker/80 backdrop-blur-xl border-b border-cyber-cyan/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group" onClick={() => setMobileOpen(false)}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-purple p-0.5"
            >
              <div className="w-full h-full rounded-lg bg-cyber-darker flex items-center justify-center">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-cyan" />
              </div>
            </motion.div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gradient anime-title">CTF WriteUp</span>
              <div className="text-[10px] sm:text-xs text-cyber-cyan/90 font-mono hidden sm:block">Web Security Battle Notes</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <NavLink to="/" active={location.pathname === '/'}>
              <BookOpen className="w-4 h-4 mr-2" />
              Home
            </NavLink>
            <NavLink to="/challenges" active={location.pathname === '/challenges'}>
              <Flag className="w-4 h-4 mr-2" />
              Challenges
            </NavLink>
            <NavLink to="/about" active={location.pathname === '/about'}>
              <User className="w-4 h-4 mr-2" />
              About
            </NavLink>
            <a
              href={GARGANTUA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link flex items-center"
            >
              <Circle className="w-4 h-4 mr-2" />
              Gargantua
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Platform
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-cyber-grid hover:text-cyber-cyan transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-80 mt-3' : 'max-h-0'
        }`}>
          <div className="flex flex-col gap-1 pb-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all ${
                location.pathname === '/'
                  ? 'text-cyber-cyan bg-cyber-cyan/10'
                  : 'text-cyber-grid hover:text-cyber-cyan hover:bg-cyber-cyan/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/challenges"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all ${
                location.pathname === '/challenges'
                  ? 'text-cyber-cyan bg-cyber-cyan/10'
                  : 'text-cyber-grid hover:text-cyber-cyan hover:bg-cyber-cyan/5'
              }`}
            >
              <Flag className="w-4 h-4" />
              Challenges
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all ${
                location.pathname === '/about'
                  ? 'text-cyber-cyan bg-cyber-cyan/10'
                  : 'text-cyber-grid hover:text-cyber-cyan hover:bg-cyber-cyan/5'
              }`}
            >
              <User className="w-4 h-4" />
              About
            </Link>
            <a
              href={GARGANTUA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono text-cyber-grid hover:text-cyber-cyan hover:bg-cyber-cyan/5 transition-all"
            >
              <Circle className="w-4 h-4" />
              Gargantua
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono text-cyber-grid hover:text-cyber-cyan hover:bg-cyber-cyan/5 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Platform
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} className={`nav-link flex items-center ${active ? 'text-cyber-cyan' : ''}`}>
      {children}
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 w-full h-px bg-cyber-cyan"
        />
      )}
    </Link>
  )
}
