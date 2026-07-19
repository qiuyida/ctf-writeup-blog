import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Terminal, Copy, Check } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ReadingProgress from './ReadingProgress'
import TableOfContents from './TableOfContents'

import { articles } from '../data/articles.js'


// 自定义代码块组件 - 带复制按钮和flag spoiler
function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')
  const lang = className?.replace('language-', '') || ''

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  // 处理 flag{...} 的 spoiler 包装
  const renderCode = useCallback(() => {
    const parts = code.split(/(flag\{[^}]+\})/g)
    if (parts.length === 1) {
      return code.split('\n').map((line, i) => (
        <div key={i}>{line || ' '}</div>
      ))
    }
    return code.split('\n').map((line, i) => {
      const lineParts = line.split(/(flag\{[^}]+\})/g)
      return (
        <div key={i}>
          {lineParts.map((part, k) =>
            /^flag\{[^}]+\}$/.test(part)
              ? <span key={k} className="spoiler-flag">{part}</span>
              : part || ' '
          )}
        </div>
      )
    })
  }, [code])

  return (
    <div className="relative my-4">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {lang && <span className="text-xs text-cyber-grid font-mono">{lang}</span>}
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-cyber-cyan/10 rounded transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-cyber-cyan" />
          ) : (
            <Copy className="w-4 h-4 text-cyber-grid" />
          )}
        </button>
      </div>
      <pre className="code-block">
        <code className="text-cyber-cyan/90">
          {renderCode()}
        </code>
      </pre>
    </div>
  )
}

// 自定义行内代码组件
function InlineCode({ children }) {
  const text = String(children)
  // 检查是否是 flag{...}
  if (/^flag\{[^}]+\}$/.test(text)) {
    return <span className="spoiler-flag">{text}</span>
  }
  return (
    <code className="px-1 py-0.5 bg-cyber-darker rounded text-cyber-pink font-mono text-sm">
      {children}
    </code>
  )
}

// 自定义段落组件 - 处理 flag{...} spoiler
function Paragraph({ children }) {
  // 如果子元素中包含纯文本的 flag{...}，需要包装
  return (
    <p className="text-cyber-grid leading-relaxed my-3">
      {children}
    </p>
  )
}

// 文章顺序 - 用于上一篇/下一篇导航
const articleOrder = ['tools', 'infoleak', 'php', 'cmd', 'pwn', 'stego', 're-plzdebugme', 'misc', 'may-2026', 'qingcen-web-2026-06-10', 'northbridge', 'qc733', 'qc734', 'qc747', 'yaml', 'timing', 'typejuggling', 'sourceleak', 'sigforge', 'notallmilk']

// 计算阅读时间（基于字数）
function estimateReadingTime(content) {
  const words = content.replace(/[#*`\[\]()]/g, '').length
  const minutes = Math.ceil(words / 500) // 假设每分钟阅读500字
  return minutes
}

export default function Article() {
  const { id } = useParams()
  const article = articles[id]

  // 计算当前文章的上一篇和下一篇
  const currentIndex = articleOrder.indexOf(id)
  const prevArticle = currentIndex > 0 ? { id: articleOrder[currentIndex - 1], ...articles[articleOrder[currentIndex - 1]] } : null
  const nextArticle = currentIndex < articleOrder.length - 1 ? { id: articleOrder[currentIndex + 1], ...articles[articleOrder[currentIndex + 1]] } : null

  // 自定义组件映射
  const components = useMemo(() => ({
    code({ node, inline, className, children, ...props }) {
      if (inline) {
        return <InlineCode>{children}</InlineCode>
      }
      return <CodeBlock className={className}>{children}</CodeBlock>
    },
    p: Paragraph,
    hr() {
      return <hr className="my-8 border-t border-cyber-grid/30" />
    },
    h2({ children }) {
      const text = typeof children === 'string' ? children : children?.[0]?.props?.value || ''
      const id = text.toLowerCase().replace(/[^\w一-龥]+/g, '-').replace(/^-+|-+$/g, '')
      return <h2 id={id} className="text-2xl font-bold text-cyber-cyan mt-8 mb-4 anime-title scroll-mt-20">{children}</h2>
    },
    h3({ children }) {
      const text = typeof children === 'string' ? children : children?.[0]?.props?.value || ''
      const id = text.toLowerCase().replace(/[^\w一-龥]+/g, '-').replace(/^-+|-+$/g, '')
      return <h3 id={id} className="text-xl font-bold text-cyber-purple mt-6 mb-3 scroll-mt-20">{children}</h3>
    },
    strong({ children }) {
      return <strong className="text-cyber-cyan font-bold">{children}</strong>
    },
    a({ href, children }) {
      return <a href={href} className="text-cyber-purple hover:text-cyber-cyan underline" target="_blank" rel="noopener noreferrer">{children}</a>
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border border-cyber-grid/30">{children}</table>
        </div>
      )
    },
    thead({ children }) {
      return <thead className="bg-cyber-darker">{children}</thead>
    },
    th({ children }) {
      return <th className="px-4 py-2 text-left text-cyber-cyan font-mono text-sm border-b border-cyber-grid/30">{children}</th>
    },
    td({ children }) {
      return <td className="px-4 py-2 text-cyber-grid text-sm border-b border-cyber-grid/20">{children}</td>
    },
    ul({ children }) {
      return <ul className="list-disc list-inside text-cyber-grid my-2 space-y-1">{children}</ul>
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside text-cyber-grid my-2 space-y-1">{children}</ol>
    },
    li({ children }) {
      return <li className="text-cyber-grid">{children}</li>
    },
  }), [])

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyber-cyan mb-4">404</h1>
          <p className="text-cyber-grid">文章不存在</p>
          <Link to="/" className="text-cyber-purple hover:text-cyber-cyan mt-4 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const readingTime = estimateReadingTime(article.content)

  return (
    <>
      <ReadingProgress />
      <TableOfContents content={article.content} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-12 sm:py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:pr-72">
          {/* Back button */}
          <Link to="/">
            <motion.button
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-cyber-grid hover:text-cyber-cyan transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-sm">返回首页</span>
            </motion.button>
          </Link>

          {/* Article header */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-cyber-purple" />
              <span className="text-cyber-purple/70 text-sm font-mono tracking-widest">
                ▶ WRITEUP
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient anime-title mb-2">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-cyber-grid text-lg font-mono">
              <span>{article.subtitle}</span>
              <span className="text-cyber-grid/50">·</span>
              <span className="text-cyber-cyan/70">{readingTime} 分钟阅读</span>
            </div>
          </motion.div>

          {/* Article content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="cyber-card p-4 sm:p-8"
          >
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {article.content}
              </ReactMarkdown>
            </div>
          </motion.div>

          {/* Article navigation - 上一篇/下一篇 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {prevArticle ? (
              <Link to={`/article/${prevArticle.id}`}>
                <motion.div
                  whileHover={{ x: -5 }}
                  className="glass-card p-4 cursor-pointer group neon-border-hover"
                >
                  <div className="flex items-center gap-2 text-cyber-grid/70 text-xs font-mono mb-1">
                    <ArrowLeft className="w-3 h-3" />
                    上一篇
                  </div>
                  <div className="text-cyber-cyan group-hover:text-white transition-colors font-bold">
                    {prevArticle.title}
                  </div>
                </motion.div>
              </Link>
            ) : <div />}

            {nextArticle ? (
              <Link to={`/article/${nextArticle.id}`}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="glass-card p-4 cursor-pointer group neon-border-hover text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-cyber-grid/70 text-xs font-mono mb-1">
                    下一篇
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div className="text-cyber-cyan group-hover:text-white transition-colors font-bold">
                    {nextArticle.title}
                  </div>
                </motion.div>
              </Link>
            ) : <div />}
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
