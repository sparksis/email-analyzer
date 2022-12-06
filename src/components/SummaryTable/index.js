import './SummaryTable.scss';

function Row(props) {
    return <div className="Row">
        <div className="To">One</div>
        <div className="Domain">Two</div>
        <div className="From">Three</div>
    </div>;
}

export default function SummaryTable() {
    return <div className="SummaryTable">
        <Row ></Row>
    </div>;
}
