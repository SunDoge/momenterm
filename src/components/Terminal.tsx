import { Component, createEffect, mergeProps, onMount } from "solid-js";
import { Terminal as Xterm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import 'xterm/css/xterm.css';
import { v4 as uuidv4 } from 'uuid';
import './Terminal.scss';
import { invoke } from '@tauri-apps/api';
import { listen } from "@tauri-apps/api/event";

type Props = {
    isActive?: boolean,
}

type Payload = {
    message: Uint8Array,
}

const Terminal: Component<Props> = (props) => {
    const merged = mergeProps({ isActive: true }, props)
    const terminalId = uuidv4();
    const backgroundColor = "#000";
    const fontFamily = 'Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace';

    let terminalDiv: HTMLDivElement;

    const terminal = new Xterm({ fontFamily });
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
        invoke('send_data', { data: data, uuid: terminalId });
    });
    terminal.onBinary((data) => {
        console.log('binary', data.length);
    })

    terminal.onResize((size) => {
        invoke('resize_terminal', { rows: size.rows, cols: size.cols, uuid: terminalId })
    })


    onMount(async () => {
        terminal.open(terminalDiv);
        // terminal.write(terminalId);

        await invoke(
            'new_terminal',
            { uuid: terminalId, shell: "zsh", rows: terminal.rows, cols: terminal.cols }
        );

        let unlisten = await listen(terminalId, event => {
            const payload = event.payload as Payload;
            terminal.write(payload.message);
        })

        fitAddon.fit()
    })



    return (
        <div ref={terminalDiv}
            class='terminal-container'
            // style={{
            //     display: merged.isActive ? 'block' : 'none',
            // }}
            style={{
                "background-color": backgroundColor,
                // "font-family": fontFamily,
            }}
        ></div>
    )
}


export default Terminal;