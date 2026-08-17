import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { logError } from '@/lib/errorLog';
import { isSupabaseSyncActive } from '@/lib/runtimeSession';

window.addEventListener('error', (event) => {
  logError({ category: 'unhandled', message: event.message, stack: event.error instanceof Error ? event.error.stack : undefined, mode: isSupabaseSyncActive() ? 'supabase' : 'local' });
});
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  logError({
    category: 'unhandled',
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    mode: isSupabaseSyncActive() ? 'supabase' : 'local',
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
