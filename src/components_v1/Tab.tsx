import { Component, createSignal } from "solid-js";
import './Tab.scss';

type Props = {
    name: string,
}


const Tab: Component<Props> = (props) => {

    return (
        <div class="tab">
            {props.name}
        </div >
    )
}

export default Tab;