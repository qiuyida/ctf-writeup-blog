import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: 30, right: 30, zIndex: 999,
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.4)',
        color: '#00d4ff', fontSize: 20, cursor: 'pointer',
        backdropFilter: 'blur(8px)',
      }}
      title="回到顶部"
    >
      ↑
    </button>
  )
}
