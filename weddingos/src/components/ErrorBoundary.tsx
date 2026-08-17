import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { logError, exportErrorLogText } from '@/lib/errorLog';
import { isSupabaseSyncActive } from '@/lib/runtimeSession';
import { downloadTextFile } from '@/utils/download';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Section 48's "Something went wrong" recovery UI. The diagnostic export
 * offered here is the bounded, locally-kept error log (lib/errorLog.ts) —
 * never guest personal data, tokens, or secrets, since the log itself
 * never records those in the first place.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Unknown error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError({
      category: 'render',
      message: error.message,
      stack: `${error.stack ?? ''}\n${info.componentStack ?? ''}`,
      mode: isSupabaseSyncActive() ? 'supabase' : 'local',
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  handleGoToDashboard = (): void => {
    window.location.hash = '#/';
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle p-6">
        <div className="max-w-md rounded-xl border border-line bg-surface p-6 text-center shadow-sm">
          <AlertOctagon className="mx-auto size-10 text-critical" aria-hidden="true" />
          <h1 className="mt-3 text-lg font-semibold text-ink">Something went wrong</h1>
          <p className="mt-1.5 text-sm text-ink-faint">
            WeddingOS hit an unexpected error. Your saved data is unaffected — this only interrupted the current screen. {this.state.message}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={this.handleRetry}>
              Retry
            </Button>
            <Button variant="secondary" onClick={this.handleGoToDashboard}>
              Go to Dashboard
            </Button>
            <Button variant="ghost" onClick={() => downloadTextFile('weddingos-diagnostic.json', exportErrorLogText(), 'application/json')}>
              Export Diagnostic Info
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
