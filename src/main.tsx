import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { ErrorProvider } from './context/ErrorContext';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);
