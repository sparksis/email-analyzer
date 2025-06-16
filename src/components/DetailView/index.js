import React from "react";
import { messagesTable } from "../../stores/messageStore.js"; // Ensure path is correct
import SummaryTree from "../SummaryTree";
import ToContainer from "./ToAddress";
import './DetailView.scss';

/**
 * `DetailView` is a React class component that serves as a container for displaying
 * email statistics. It fetches a list of unique 'To' addresses from the `messageStore`
 * to populate a filter (`ToContainer`). The selected filter is then passed to the
 * `SummaryTree` component to display filtered email statistics.
 * @extends React.Component
 */
export class DetailView extends React.Component {
    /**
     * Initializes the component's state.
     * @param {object} props - The component's props (currently not expecting any).
     */
    constructor(props) {
        super(props);
        /**
         * Component state.
         * @type {{toAddresses: Array<string>|null, filter: string|null}}
         * @property {Array<string>|null} toAddresses - A list of unique 'To' email addresses, or null if not yet loaded.
         * @property {string|null} filter - The currently selected 'To' address to filter the SummaryTree by.
         */
        this.state = { toAddresses: null, filter: null };
    }

    /**
     * Lifecycle method called after the component mounts.
     * Fetches unique 'To' addresses from the `messagesTable` in `messageStore`
     * and updates the component's state with these addresses.
     * @async
     */
    async componentDidMount() {
        try {
            // Fetches an array of unique values from the 'to' index.
            const uniqueToAddresses = await messagesTable.orderBy('to').uniqueKeys();
            this.setState({
                toAddresses: uniqueToAddresses,
            });
        } catch (error) {
            console.error("DetailView: Failed to fetch 'to' addresses", error);
            this.setState({ toAddresses: [] }); // Set to empty array or handle error state
        }
    }

    /**
     * Renders the DetailView component.
     * It includes a `ToContainer` for address filtering and a `SummaryTree`
     * to display the statistics based on the selected filter.
     * @returns {JSX.Element} The rendered DetailView.
     */
    render() {
        return (
            <div className="DetailView">
                <ToContainer
                    addresses={this.state.toAddresses}
                    onChange={(address) => this.setState({ filter: address })}
                />
                <SummaryTree filter={this.state.filter} />
            </div>
        );
    }
}
