import React, { Component } from 'react';
import { generateStats } from '../../poc/messages';
import './SummaryTable.scss';

export default class SummaryTable extends Component {

    interval = null;

    constructor() {
        super();
        this.state = { view: null };
    }

    componentDidMount() {
        this.load();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async load() {
        const tree = await generateStats();
        const types = ['To', 'Domain', 'From'];
        // const view = Object.keys(tree).reduce((prev, key) => prev + this.renderNode(tree[key], types, key));
        const view = this.renderNode(types, tree.entries())
        this.setState({ view })
    }

    renderNode(types, node) {
        const type = types[0];
        const element = [...node].map(function ([key, value]) {
            return <div key={key.key} className={type}><span>{key.key} ({key.count})</span>{this.renderNode(types.slice(1), value.entries())}</div>
        }.bind(this));

        return element;
    }

    render() {
        return <pre style={{ fontFamily: "Cascadia Code" }}>{this.state.view}</pre>;
    }

}
