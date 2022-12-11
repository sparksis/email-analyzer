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
        setInterval(() => {
            this.load();
        }, 200);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async load() {
        const tree = await generateStats();
        const types = ['To', 'Domain', 'From'];
        // const view = Object.keys(tree).reduce((prev, key) => prev + this.renderNode(tree[key], types, key));
        const view = this.renderNode(types, tree)
        this.setState({ view })
    }

    renderNode(types, node) {
        const type = types[0];
        const element = [...node.entries()].map(function ([key, value]) {
            let keyElement;
            if (this['render' + type]) {
                keyElement = this['render' + type](key);
            } else {
                keyElement = this.renderUnknownKey(key);
            }
            return <div key={key.key} className={type}>{keyElement}{this.renderNode(types.slice(1), value)}</div>
        }.bind(this));

        return element;
    }

    renderUnknownKey(key) {
        return <span>{key.key} ({key.count})</span>;
    }
    renderFrom(key) {
        const query = `from: ${key.key}`;
        const link = `https://mail.google.com/mail/u/#search/${encodeURIComponent(query)}`
        return <span><a target='gmail' href={link}>{key.key}</a> ({key.count})</span>;
    }
    renderDomain = this.renderFrom;

    render() {
        return <pre className='SummaryTree' style={{ fontFamily: "Cascadia Code" }}>{this.state.view}</pre>;
    }

}
