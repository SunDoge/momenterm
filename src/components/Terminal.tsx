import { Component, createEffect, mergeProps, onMount } from "solid-js";
import { Terminal as Xterm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import 'xterm/css/xterm.css';
import { v4 as uuidv4 } from 'uuid';
import './Terminal.scss';

type Props = {
    isActive?: boolean,
}

const Terminal: Component<Props> = (props) => {
    const merged = mergeProps({ isActive: true }, props)
    const terminalId = uuidv4();

    let terminalDiv: HTMLDivElement;

    const terminal = new Xterm();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    const resizeObserver = new ResizeObserver(() => {
        setTimeout(() => fitAddon.fit(), 100)
    });

    createEffect(() => {
        if (merged.isActive) {
            fitAddon.fit();
            resizeObserver.observe(terminalDiv);
            console.log('observe', terminalDiv);
        } else {
            resizeObserver.unobserve(terminalDiv);
            console.log('unobserve')
        }
    })

    terminal.onData((data) => {
        terminal.write(data);
    })

    onMount(() => {
        terminal.open(terminalDiv);
        terminal.write(terminalId);
        for (let i = 0; i < 100; i++) {
            terminal.write(i.toString() + '\r\n');
        }
        fitAddon.fit()
    })



    return (
        <div ref={terminalDiv}
            class='terminal-container'
        // style={{
        //     display: merged.isActive ? 'block' : 'none',
        // }}
        ></div>
    )
}


export default Terminal;