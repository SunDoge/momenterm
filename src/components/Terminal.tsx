import { Component, onMount } from 'solid-js';
import { Terminal as Xterm } from 'xterm';
import 'xterm/css/xterm.css'


const Terminal: Component = () => {
    const terminal = new Xterm();

    onMount(() => {
        terminal.open(document.getElementById('terminal'));
    })

    return (
        <div id='terminal'></div>
    )
}


export default Terminal;
