import { Component, createSignal, For } from "solid-js";
import Tab from "./Tab";
import { v4 as uuidv4 } from 'uuid';
import Terminal from "./Terminal";
import './Tabs.scss';

const TabBar: Component = () => {

    const [activeTab, setActiveTab] = createSignal(uuidv4())
    const [tabs, setTabs] = createSignal([activeTab()])

    return (
        <>
            <ul class="inline">
                <For each={tabs()}>{(tab, index) =>
                    <li onClick={() => setActiveTab(tab)} classList={{ selected: tab == activeTab() }}>
                        <Tab name={index().toString()}></Tab>
                    </li>
                }</For>
                <li>
                    <button onClick={() => { setActiveTab(uuidv4()); setTabs([...tabs(), activeTab()]); }}>+</button>
                </li>
            </ul>

            <For each={tabs()}>{(tab, index) =>
                <div class="tab-content" style={
                    {
                        visibility: tab == activeTab() ? "visible" : "hidden",
                        // display: tab == activeTab() ? "block" : "none",
                    }
                }>
                    <Terminal uuid={tab}></Terminal>
                </div>
            }</For>
        </>
    )
}

export default TabBar;