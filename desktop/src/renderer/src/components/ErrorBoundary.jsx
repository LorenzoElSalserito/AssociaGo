import { Component } from 'react'
import i18n from 'i18next'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Renderer] Unhandled page error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      const t = (key, fallback) => i18n.t(key) || fallback
      return (
        <div className="alert alert-danger border-0 shadow-sm">
          <h5 className="mb-2">{t('errors.pageUnavailableTitle', 'Page unavailable')}</h5>
          <p className="mb-2">
            {t('errors.pageUnavailableBody', 'The module encountered a runtime error. The shell is still active and you can switch to another section.')}
          </p>
          <pre className="mb-0 small text-wrap">{this.state.error?.message || t('errors.unknown', 'Unknown error')}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
