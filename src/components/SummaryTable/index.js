import { fontStyle } from '@mui/system';
import React, { Component } from 'react';
import { generateStats } from '../../poc/messages';
import './SummaryTable.scss';

export function To(props) {
    return <div className='To'></div>
}

export default class SummaryTable extends Component {

    timeout = null;

    constructor() {
        super();
        this.state = { view: null };
    }

    componentDidMount() {
        this.load();
        this.timeout = setTimeout(() => {
            this.load();
        }, 200);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    async load() {
        const tree = await generateStats();
        const types = ['Root', 'To', 'Domain', 'From'];
        // const view = Object.keys(tree).reduce((prev, key) => prev + this.renderNode(tree[key], types, key));
        const view = this.renderNode(tree, types)
        this.setState({ view })
    }

    renderNode(node, types, value) {
        const type = types[0];
        let nodeComponent = null;
        if (value && value !== '_count') {
            let text = value;
            // if (node[value]) text += node[value]._count;
            if (node._count) {
                text += ` (${node._count})`;
            } else {
                text += ` (${node})`
            }
            nodeComponent = <div className={type}>{text}</div>;
        }
        const children = Object.keys(node).reduce((prev, value) => prev.concat(this.renderNode(node[value], types.slice(1), value)), [])
        return [nodeComponent, ...children];
    }

    render() {
        console.log(this.state);
        return <pre style={{ fontFamily: "Cascadia Code" }}>{this.state.view}</pre> || <></>;
    }

}
