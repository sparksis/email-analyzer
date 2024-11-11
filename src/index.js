import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { pink, lightGreen, blue, grey } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material';
import { CssBaseline, Button } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: blue[500],
    },
    secondary: {
      main: grey[500],
    },
    background: '#fff'
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
    background: '#000'
  },
});

function ThemedApp() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <Button onClick={toggleTheme}>
        Toggle Theme
      </Button>
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
