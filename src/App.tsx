import type { Component } from 'solid-js';
import './App.scss';
import Terminal from './components/Terminal';

const App: Component = () => {
  return (
    <>
      <h1 class="header">Hello Sass!</h1>
      <Terminal></Terminal>
    </>
  );
};

export default App;
