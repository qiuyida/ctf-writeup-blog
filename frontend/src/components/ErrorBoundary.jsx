import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center glass-card p-8 neon-border">
            <p className="text-sm text-cyber-grid">页面渲染出错，请稍后重试。</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
