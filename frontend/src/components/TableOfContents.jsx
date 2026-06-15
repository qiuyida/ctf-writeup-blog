import { useState, useEffect } from 'react'

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([])

  useEffect(() => {
    if (!content) return
    const matches = content.match(/^#{1,3}\s+.+$/gm) || []
    const items = matches.map((m) => {
      const level = m.match(/^#+/)[0].length
      const text = m.replace(/^#+\s+/, '')
      const id = text.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-|-$/g, '')
      return { level, text, id }
    })
    setHeadings(items)
  }, [content])

  if (headings.length < 2) return null

  return (
    <nav style={{
      position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto', padding: '16px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      fontSize: 13, color: '#8899aa',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 10, color: '#aab' }}>目录</div>
      {headings.map((h, i) => (
        <a
          key={i}
          href={`#${h.id}`}
          style={{
            display: 'block', padding: '4px 0',
            paddingLeft: (h.level - 1) * 12,
            color: '#8899aa', textDecoration: 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}
