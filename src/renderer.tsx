/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 */

import './i18n'; // Initialize i18n
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ AI Background Remover - Renderer loaded');
