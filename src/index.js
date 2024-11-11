import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { pink, lightGreen } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: pink[500],
    },
    secondary: {
      main: lightGreen[500],
    },
    background: '#f0f0f0',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: pink[500],
    },
    secondary: {
      main: lightGreen[500],
    },
    background: '#000',
  },
});

function ThemedApp() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
);

reportWebVitals();
