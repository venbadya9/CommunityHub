import { Component, ReactNode } from "react";
import { RetryState } from "./RetryState";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("App Crash Boundary Captured:", error, info.componentStack);
  }

  clearError = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <RetryState
          title="Something went wrong."
          message="The app encountered an unexpected issue. Tap try again or restart the application if the issue persists."
          onRetry={this.clearError}
          retryLabel="Try again"
        />
      );
    }

    return this.props.children;
  }
}
