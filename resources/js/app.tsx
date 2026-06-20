import { initializeTheme } from '@/hooks/use-appearance';
import { store } from '@/lib/store';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import { createInertiaApp } from '@inertiajs/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';

import '../css/app.css';
import './bootstrap';

import { createRoot, hydrateRoot } from 'react-dom/client';
import SnackbarProvider from './components/snackbar-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const muiTheme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    mode: 'light',
    background: {
      default: '#f9fafb',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },
});

createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob<{ default: React.ComponentType<any> }>(
      './pages/**/*.tsx',
      { eager: true },
    );

    const tryPaths = [
      `./pages/${name}.tsx`,
      `./pages/${name}.jsx`,
      `./pages/${name}/index.tsx`,
      `./pages/${name}/index.jsx`,
    ];

    for (const p of tryPaths) {
      if (pages[p]) return pages[p].default;
    }

    throw new Error(`Page not found: ${name} (tried: ${tryPaths.join(', ')})`);
  },

  setup({ el, App, props }) {
    const root = (
      <Provider store={store}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <App {...props} />
          <SnackbarProvider />
        </ThemeProvider>
      </Provider>
    );

    if (typeof window !== 'undefined' && el && (el as Element).nodeType === 1) {
      const container = el as Element;

      if (container.hasChildNodes()) {
        hydrateRoot(container, root);
      } else {
        createRoot(container).render(root);
      }
    }
  },
});

initializeTheme();
