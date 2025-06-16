import React from "react";
import messages from "../../poc/messages";
import SummaryTree from "../SummaryTree";
import ToContainer from "./ToAddress";

export class DetailView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { toAddresses: null, filter: null }
    }

    async componentDidMount() {
        this.setState({
            toAddresses: await messages.orderBy('to').uniqueKeys(),
        });
    }

    render() {
        return <div className="p-[1em] bg-white text-[#333333] dark:bg-[#252725] dark:text-white">
            <ToContainer addresses={this.state.toAddresses} onChange={(address) => this.setState({ filter: address })} />
            <SummaryTree filter={this.state.filter} />
        </div>;
    }
}
