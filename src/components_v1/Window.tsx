import { Component } from "solid-js";
import Panel from "./Panel";
import './Window.scss';

type Props = {
    // uuid: string,
}

const Window: Component<Props> = (props) => {

    return (
        <div class="panel-container">
            <Panel></Panel>
        </div>
    )
}

export default Window;