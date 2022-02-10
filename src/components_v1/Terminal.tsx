import { Component, createEffect, createSignal, on, onMount, splitProps } from 'solid-js';
import { Terminal as Xterm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Terminal.scss';
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { v4 as uuidv4 } from 'uuid';

type Props = {
    // uuid: string
}

type Payload = {
    message: Uint8Array,
}

const Terminal: Component<Props> = (props) => {
    let terminalDiv;

    const uuid = uuidv4();

    const terminal = new Xterm();
    // const terminalCore = terminal['_core'];
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    const resizeObserver = new ResizeObserver(() => {
        // fitAddon.fit();
        setTimeout(() => {
            fitAddon.fit();
            // terminalCore.viewport._refresh();
        });
    });

    onMount(async () => {
        terminal.open(terminalDiv);
        fitAddon.fit();
        terminal.write(uuid);
        resizeObserver.observe(terminalDiv);

        const event_name: string = await invoke(
            'new_terminal',
            { uuid: uuid, shell: "zsh", rows: terminal.rows, cols: terminal.cols }
        );

        terminal.onData((data) => {
            invoke('send_data', { data: data, uuid: uuid });
        });
        terminal.onBinary((data) => {
            console.log('binary', data.length);
        })

        terminal.onResize((size) => {
            invoke('resize_terminal', { rows: size.rows, cols: size.cols, uuid: uuid })
        })

        let unlisten = await listen(event_name, event => {
            const payload = event.payload as Payload;
            terminal.write(payload.message);
        })

        // setInterval(() => {
        //     fitAddon.fit();
        // }, 100);
    })

    return (
        <div ref={terminalDiv} class='terminal-container'></div>
    )
}


export default Terminal;
