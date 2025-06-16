import React, { Component } from 'react';
import { generateStats } from '../../poc/messages';

export default class SummaryTree extends Component {

    interval = null;

    constructor(props) {
        super(props);
        this.state = { tree: null };
    }

    componentDidMount() {
        this.load();
        // setInterval(() => {
        //     this.load();
        // }, 200);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async load() {
        const tree = await generateStats();
        this.setState({ tree });
    }

    // In SummaryTree class

renderNode(types, node, depth = 0, parentPrefixes = "") {
    const type = types[0];
    if (!type || !node) return null;

    const entries = [...node.entries()]; // Get entries to know the length for isLast logic

    const element = entries.map(([key, value], index) => {
        if (type === 'To' && this.props.filter && this.props.filter !== key.key && depth === 0) { // filter only applies to 'To' type at depth 0
            return null;
        }

        let keyElement;
        if (this['render' + type]) {
            keyElement = this['render' + type](key);
        } else {
            keyElement = this.renderUnknownKey(key);
        }

        const isLast = index === entries.length - 1;
        let currentPrefix = "";
        let childParentPrefixes = parentPrefixes;

        if (depth > 0) { // 'To' nodes (depth 0) don't have a prefix from parent
            currentPrefix = isLast ? "└─ " : "├─ ";
            childParentPrefixes += isLast ? "   " : "│  ";
        } else {
            // For 'To' nodes, ensure childParentPrefixes starts empty for their direct children (Domains)
             childParentPrefixes = ""; // Reset for children of 'To'
        }


        // Indentation based on depth. Tailwind's pl- provides 0, 1, 2, 3, 4, 5, 6, ... (0.25rem increments)
        // We can use pl-N where N is depth * 4 for a noticeable indent. Max out if depth gets too large.
        const indentationClass = `pl-${Math.min(depth * 4, 40)}`; // e.g., depth 0: pl-0, depth 1: pl-4, depth 2: pl-8. Max pl-40.

        // The div className was 'type', e.g., "To", "Domain", "From".
        // We might not need these classes anymore if all styling is via Tailwind and structure.
        // Let's keep them for now in case they are used by tests or other logic, but prefix with 'node-'
        const typeClassName = `node-${type}`;

        return (
            <div key={key.key} className={`${typeClassName} ${indentationClass}`}>
                {depth > 0 && <span className="mr-1">{parentPrefixes + currentPrefix}</span>}
                {keyElement}
                {types.length > 1 && this.renderNode(types.slice(1), value, depth + 1, childParentPrefixes)}
            </div>
        );
    }).filter(Boolean); // Filter out nulls from filtered 'To'

    return element;
}

    renderUnknownKey(key) {
        return <span className="truncate">{key.key} ({key.count})</span>;
    }
    renderFrom(key) {
        const query = `from:${key.key}`;
        const link = `https://mail.google.com/mail/u/#search/${encodeURIComponent(query)}`
        // Apply truncate to the link text itself.
        return <span><a target='gmail' href={link} className="truncate text-[#333] dark:text-white visited:line-through visited:decoration-red-500 visited:decoration-wavy active:bg-yellow-300">{key.key}</a> ({key.count})</span>;
    }
    renderDomain = this.renderFrom;

    render() {
        const types = ['To', 'Domain', 'From'];
        // Initial call to renderNode: depth = 0, parentPrefixes = "" (defaults)
        const view = this.state.tree && this.renderNode(types, this.state.tree);

        return <div className='font-cascadia'>{view}</div>;
    }

}
