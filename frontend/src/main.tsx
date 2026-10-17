import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const mount = (el: HTMLElement) => {
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

const root = document.getElementById('personal-whatsapp-root');
if (root) mount(root);

(window as any).PersonalWhatsapp = { mount };
