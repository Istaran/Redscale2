registerControl('reassigner', (colIndex, rowIndex, control) => {
    return <Reassigner key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftSet={control.leftSet} rightSet={control.rightSet} displays={control.displays} id={control.id} />;
});

class Reassigner extends React.Component {
    constructor(props) {
        super(props);

        // track updated numbers as state.
        var leftSet = props.leftSet.slice();
        var rightSet = props.rightSet.slice();

        this.state = {
            leftSet: leftSet,
            rightSet: rightSet
        }
    }

    moveLeft(index) {
        var leftSet = this.state.leftSet.slice();
        var rightSet = this.state.rightSet.slice();
        var mover = rightSet.splice(index, 1)[0];
        leftSet.push(mover);
        this.setState({
            leftSet: leftSet,
            rightSet: rightSet
        });
    }

    moveRight(index) {
        var leftSet = this.state.leftSet.slice();
        var rightSet = this.state.rightSet.slice();
        var mover = leftSet.splice(index, 1)[0];
        rightSet.push(mover);
        this.setState({
            leftSet: leftSet,
            rightSet: rightSet
        });
    }
    
    done() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': 'requantify', 'slot': GameDisplayer.saveSlot, 'id': self.props.id, 'data': { 'left': this.state.leftSet, 'right': this.state.rightSet } } })
        }).then(function (response) {
            return response.json();
        }).then(function(data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        let self = this;
        let leftRows = self.state.leftSet.map((assignee, index) => {
            let row = self.props.displays[assignee.displayIndex].leftCards.map((card, subindex) => {
                return <div className={"card " + card.subtype} key={"left " + index + "-" + subindex} onClick={() => self.moveRight(index)}>{card.cardlines}</div>;
            });
            return <div className="reassignerRow" key={"left " + index}>{self.props.displays[assignee.displayIndex].display}: {row}</div>
        });
        let rightRows = self.state.rightSet.map((assignee, index) => {
            let row = self.props.displays[assignee.displayIndex].rightCards.map((card, subindex) => {
                return <div className={"card " + card.subtype} key={"right " + index + "-" + subindex} onClick={() => self.moveLeft(index)}>{card.cardlines}</div>;
            });
            return <div className="reassignerRow" key={"right " + index}>{self.props.displays[assignee.displayIndex].display}: {row}</div>
        });

        return <div className="screencover">
            <div className="reassigner">
                <div className="reassignerColumn">
                    <div className="reassignerLeftColumnHeader">{self.props.leftHeader}</div>
                    {leftRows}
                </div>
                <div className="reassignerSpacer">
                    <div className="reassignerHeaderSpacer">
                        <input type='button' onClick={() => self.done()} value="Done" />
                    </div>
                </div>
                <div className="reassignerColumn">
                    <div className="reassignerRightColumnHeader">{self.props.rightHeader}</div>
                    {rightRows}
                </div>
            </div>
        </div>;
    }
}