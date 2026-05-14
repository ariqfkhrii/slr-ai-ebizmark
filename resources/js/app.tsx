import SnackbarProvider from '@/components/snackbar-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { store } from '@/lib/store';
import { createInertiaApp } from '@inertiajs/react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  layout: (name) => {
    switch (true) {
      case name === 'welcome':
        return null;
      case name.startsWith('auth/'):
        return AuthLayout;
      case name.startsWith('settings/'):
        return [AppLayout, SettingsLayout];
      default:
        return AppLayout;
    }
  },
  strictMode: true,
  withApp(app) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />

          <TooltipProvider delayDuration={0}>
            {app}
            <SnackbarProvider />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </Provider>
    );
  },
  progress: {
    color: '#4B5563',
  },
});

const muiTheme = createTheme({
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

// This will set light / dark mode on load...
initializeTheme();
