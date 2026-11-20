import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CmsProvider } from './context/CmsContext.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CmsProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </CmsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
