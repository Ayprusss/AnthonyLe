import React from 'react';
import ReactDOM from 'react-dom/client';

// Archivo carries the whole site; wdth.css is the cut with both the
// weight and the width axis, which is what the name at display size
// needs. Plex Mono is loaded at one weight because it appears in one
// place — the boot log.
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/400.css';

import './theme.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
