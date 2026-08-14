import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from '@/components/ui/sonner';
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { LanguageProvider } from '@/lib/i18n';

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LanguageProvider>
        <App />
        <Toaster />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
)
