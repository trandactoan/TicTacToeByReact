import React from 'react';
import ReactDOM from 'react-dom/client';
import Game from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Game boardSize={20}/>
  </React.StrictMode>
);