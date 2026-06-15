import { useState, useEffect } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: 3, zIndex: 1001,
      background: 'transparent',
    }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
        transition: 'width 0.1s',
      }} />
    </div>
  )
}
