// Registers the <goa-*> custom elements that @abgov/react-components wraps.
import '@abgov/web-components';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App.tsx';
import { ReportFormProvider } from './form/ReportFormContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ReportFormProvider>
        <App />
      </ReportFormProvider>
    </BrowserRouter>
  </StrictMode>,
);
