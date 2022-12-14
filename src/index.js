import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { pink, lightGreen } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({

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
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
