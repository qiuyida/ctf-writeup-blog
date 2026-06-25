import { useMemo } from 'react'

function HeadingItem({ id, text, level, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`block w-full text-left px-2 py-1 rounded text-xs border border-transparent hover:border-cyber-cyan/60 hover:text-cyber-cyan transition-colors ${level === 1 ? 'font-bold' : 'text-cyber-grid/80'}`}
    >
      {text}
    </button>
  )
}

export default function TableOfContents({ content }) {
  const headings = useMemo(() => {
    const lines = String(content || '').split('\n')
    const res = []
    for (const line of lines) {
      const m = line.match(/^(#{1,3})\s+(.+)$/)
      if (!m) continue
      const level = m[1].length
      const text = m[2].replace(/[`*_]+/g, '').trim()
      const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '')
      if (text && id) res.push({ id, text, level })
    }
    return res
  }, [content])

  if (!headings.length) return null

  const onSelect = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  }

  return (
    <div className="hidden lg:block fixed right-6 top-32 w-56">
      <div className="text-xs font-mono text-cyber-grid mb-2">目录</div>
      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
        {headings.slice(0, 30).map((h, i) => (
          <HeadingItem key={i} {...h} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
