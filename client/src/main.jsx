import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bootstrap first, then our token and theme layers override it.
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/tokens.css';
import './styles/theme.css';
import './index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
