import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 800, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
          <h1 style={{ color: '#ff4444' }}>出错了</h1>
          <p style={{ color: '#888' }}>页面加载失败，请刷新重试。</p>
        </div>
      )
    }
    return this.props.children
  }
}
