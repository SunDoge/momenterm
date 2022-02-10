import { Component, createEffect, createSignal, For } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import './App.scss';
import Terminal from './components/Terminal';
import { v4 as uuidv4 } from 'uuid';

const App: Component = () => {


  const [activeTab, setActiveTab] = createSignal(uuidv4())
  const [tabs, setTabs] = createSignal([activeTab()])

  return (
    <div class='app-container'>
      <div class='tab-bar'>
        <For each={tabs()}>{(tab, index) =>
          <button class='tab'
            classList={{
              selected: tab == activeTab(),
            }}
            onClick={() => { setActiveTab(tab) }}
          >{tab.slice(0, 8)}</button>
        }</For>
        <button
          onClick={() => {
            setActiveTab(uuidv4());
            setTabs([...tabs(), activeTab()])
          }}
        >+</button>
      </div>
      <div class='window-container'>
        <For each={tabs()}>{(tab, index) =>
          <div class='window'
            style={{
              display: tab == activeTab() ? 'flex' : 'none',
            }}
          >
            <div class='panel'>
              <Terminal isActive={tab == activeTab()}></Terminal>
            </div>
          </div>
        }</For>
      </div>
    </div>
  )
};

export default App;
