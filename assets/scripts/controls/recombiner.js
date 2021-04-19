registerControl('recombiner', (colIndex, rowIndex, control) => {
    return <Recombiner key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftSet={control.leftSet} rightSet={control.rightSet} displays={control.displays} id={control.id} />;
});

class Recombiner extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            leftSet: Object.assign({}, props.leftSet),
            rightSet: props.rightSet.slice(),
            leftSelect: 0,
            rightSelect: 0,
            displays: props.displays,
            id: props.id
        }
    }

    use() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
                'body': {
                    'verb': 'use', 'slot': GameDisplayer.saveSlot, 'id': self.state.id, 'data': {
                        'item': self.item, 'user': { 'type': (self.state.rightSelect ? "pawn" : "leader"), 'index': (self.state.rightSelect - 1) } 
                    }
                }
            })
        }).then(function (response) {
            return response.json();
            }).then(function (data) {
                self.setState({
                    leftSet: Object.assign({},data.controls[0][0].leftSet),
                    rightSet: data.controls[0][0].rightSet.slice(),
                    displays: data.controls[0][0].displays.slice(),
                    id: data.controls[0][0].id,
                    frame: GameDisplayer.frame++,
                });
            }).catch(function (err) {
                setError();
            });
    }

    done() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': 'setscene', 'slot': GameDisplayer.saveSlot, 'id': self.state.id } })
        }).then(function (response) {
            return response.json();
        }).then(function(data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    setLeftIndex(e) {
        let idx = parseInt(e.target.attributes["myindex"].value);
        this.setState({ leftSelect: idx });
    }

    setRightIndex(e) {
        let idx = parseInt(e.target.attributes["myindex"].value);
        this.setState({ rightSelect: idx });
    }

    render() {
        let self = this;
        let leftRows = [];
        var leftIndex = 0;
        for (var leftRow in self.state.leftSet) {
            let leftItem = self.state.leftSet[leftRow];
            let card = self.state.displays[leftItem.displayIndex];
            if (leftIndex == self.state.leftSelect)
                self.item = leftRow;
            leftRows.push(<div className="recombinerRow" key={"left " + leftIndex}>{leftItem.count + ' x '}<div className={"card " + card.type + (leftIndex == self.state.leftSelect ? " selectedCard" : "")} onClick={(e) => self.setLeftIndex(e)} myindex={leftIndex}>{card.text}</div></div>);
            leftIndex++;
        }
        let rightRows = self.state.rightSet.map((assignee, index) => {
            let card = self.state.displays[assignee.displayIndex];
            return <div className="recombinerRow" key={"right " + index}><div className={"card " + card.type + (index == self.state.rightSelect ? " selectedCard" : "")} onClick={(e) => self.setRightIndex(e)} myindex={index}>{card.text}</div></div>;
        });

        return <div className="screencover">
            <div className="recombiner">
                <div className="recombinerColumn">
                    <div className="recombinerColumnHeader">{self.props.leftHeader}</div>
                    {leftRows}
                </div>
                <div className="recombinerSpacer">
                    <div className="recombinerHeaderSpacer">
                        <input type='button' onClick={() => self.done()} value="Done" />
                    </div>
                    <div className="recombinerColumnSpacer">
                        <input type='button' onClick={() => self.use()} value="Use" disabled={leftIndex == 0} />
                    </div>
                </div>
                <div className="recombinerColumn">
                    <div className="recombinerColumnHeader">{self.props.rightHeader}</div>
                    {rightRows}
                </div>
            </div>
        </div>;
    }
}