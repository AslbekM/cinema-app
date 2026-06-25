import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/** Catches render errors anywhere below it and shows a friendly fallback
 *  instead of a blank white screen (graceful degradation). */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In a real deployment this would go to a logging/monitoring service.
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="empty-state">
            <span className="emoji">🙈</span>
            <h3>Something went wrong</h3>
            <p className="text-muted">An unexpected error occurred. Try reloading the page.</p>
            <button className="btn btn-success mt-2" onClick={() => window.location.assign('/app/')}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
