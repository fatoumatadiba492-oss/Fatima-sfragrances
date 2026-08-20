import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ← IMPORTANT : Doit être présent !

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}