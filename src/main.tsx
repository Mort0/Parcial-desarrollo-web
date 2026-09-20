// Libraries
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// App
import App from './App';

// Context
import { ThemeProvider } from './context/ThemeContext';

// Styles
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
