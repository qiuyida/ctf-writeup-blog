import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error)
    this.setState({ errorMsg: error?.message || String(error), errorStack: info?.componentStack || '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center glass-card p-8 neon-border max-w-lg">
            <p className="text-sm text-red-400 mb-4">页面渲染出错</p>
            <pre className="text-xs text-cyber-grid/70 text-left whitespace-pre-wrap break-all mb-2">{this.state.errorMsg}</pre>
            {this.state.errorStack && (
              <details className="mt-2">
                <summary className="text-xs text-cyber-purple cursor-pointer">组件堆栈</summary>
                <pre className="text-xs text-cyber-grid/50 text-left mt-2 whitespace-pre-wrap">{this.state.errorStack}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
