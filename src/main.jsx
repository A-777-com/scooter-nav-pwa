import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './animations.css';
import './mobile.css';

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ SW зарегистрирован:', registration);
      })
      .catch(error => {
        console.log('❌ Ошибка регистрации SW:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
