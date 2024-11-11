import React from "react";
import messages from "../../poc/messages";
import SummaryTree from "../SummaryTree";
import ToContainer from "./ToAddress";
import './DetailView.scss'

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
        return <div className="DetailView" data-testid="detail-view">
            <ToContainer addresses={this.state.toAddresses} onChange={(address) => this.setState({ filter: address })} />
            <SummaryTree filter={this.state.filter} />
        </div>;
    }
}
