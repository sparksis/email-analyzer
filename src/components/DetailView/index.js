import React from "react";
import messages from "../../poc/messages";
import SummaryTree from "../SummaryTree";
import ToContainer from "./ToAddress";
import MasonryView from "../MasonryView";
import './DetailView.scss'

export class DetailView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { toAddresses: null, filter: null, emailData: [] }
    }

    async componentDidMount() {
        this.setState({
            toAddresses: await messages.orderBy('to').uniqueKeys(),
        });
        this.loadEmailData();
    }

    async loadEmailData() {
        const emailData = await messages.toArray();
        const emailCountBySender = emailData.reduce((acc, email) => {
            acc[email.from] = (acc[email.from] || 0) + 1;
            return acc;
        }, {});
        const formattedEmailData = Object.keys(emailCountBySender).map(sender => ({
            sender,
            emailCount: emailCountBySender[sender]
        }));
        this.setState({ emailData: formattedEmailData });
    }

    render() {
        return <div className="DetailView">
            <ToContainer addresses={this.state.toAddresses} onChange={(address) => this.setState({ filter: address })} />
            <SummaryTree filter={this.state.filter} />
            <MasonryView emailData={this.state.emailData} />
        </div>;
    }
}
