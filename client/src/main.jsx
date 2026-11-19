import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { TouchKeyboardHost } from './components/TouchKeyboardHost';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <TouchKeyboardHost />
  </React.StrictMode>,
);
