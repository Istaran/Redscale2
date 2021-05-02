GameDisplayer.registerControl('requantifier', (colIndex, rowIndex, control) => {
    return <Requantifier key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftCounts={control.leftCounts} leftChecks={control.leftChecks} rightCounts={control.rightCounts} displays={control.displays} id={control.id} rules={control.rules}/>;
});

class Requantifier extends React.Component {
    constructor(props) {
        super(props);

        // track updated numbers as state.
        var leftCounts = Object.assign({}, props.leftCounts);
        var rightCounts = Object.assign({}, props.rightCounts);
        var leftChecks = props.leftChecks ? Object.assign({}, props.leftChecks) : undefined;
        var thing;
        for (thing in props.displays) {
            leftCounts[thing] = leftCounts[thing] || 0;
            rightCounts[thing] = rightCounts[thing] || 0;
        }

        this.state = {
            leftCounts: leftCounts,
            rightCounts: rightCounts,
            leftChecks: leftChecks
        }
    }

    sum(counts) {
        var total = 0;
        for (var label in counts) {
            if (!isNaN(counts[label]))
                total += counts[label];
        }
        return total;
    }

    checkrules() {
        if (!this.props.rules) return true;

        for (var rule in this.props.rules) {
            let val = this.props.rules[rule];
            switch (rule) {
                case "left minimum count":
                    if (this.sum(this.state.leftCounts) < val)
                        return false;
                    break;
                case "right minimum count":
                    if (this.sum(this.state.rightCounts) < val)
                        return false;
                    break;
                case "left check count":
                    if (this.sum(this.state.leftChecks) != val)
                    return false;
                    break;
            }
        }

        return true; 
    }

    change(thing, deltaRight) {
        if (deltaRight > this.state.leftCounts[thing])
            deltaRight = this.state.leftCounts[thing];
        if (deltaRight < -this.state.rightCounts[thing])
            deltaRight = -this.state.rightCounts[thing];
        var newState = {
            leftCounts: Object.assign({}, this.state.leftCounts),
            rightCounts: Object.assign({}, this.state.rightCounts),
            leftChecks: this.state.leftChecks ? Object.assign({}, this.state.leftChecks) : undefined
        };
        newState.leftCounts[thing] = this.state.leftCounts[thing] - deltaRight;
        newState.rightCounts[thing] = this.state.rightCounts[thing] + deltaRight;
        if(newState.leftChecks && newState.leftChecks[thing] && !newState.leftCounts[thing]) {
            newState.leftChecks[thing] = undefined;
        }

        this.setState(newState);
    }

    setCheck(thing) {
        if (this.state.leftCounts[thing]) {
            var newState = {
                leftCounts: Object.assign({}, this.state.leftCounts),
                rightCounts: Object.assign({}, this.state.rightCounts),
                leftChecks: Object.assign({}, this.state.leftChecks)
            };
            newState.leftChecks[thing] = (newState.leftChecks[thing] || !newState.leftCounts[thing] ?undefined : 1);
            this.setState(newState);
        }
    }

    done() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': 'requantify', 'slot': GameDisplayer.saveSlot, 'id': self.props.id, 'data': { 'left': this.state.leftCounts, 'right': this.state.rightCounts, 'leftChecks': this.state.leftChecks }} })
        }).then(function (response) {
            return response.json();
        }).then(function(data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        var rows = [];
        for (var thing in this.props.displays) {
            let checkbox = null;
            if (this.state.leftChecks) {
                checkbox = <input className="requantify" type="checkbox" checked={this.state.leftChecks[thing]} onClick={(event) => this.setCheck(event.target.getAttribute("thing"))} key={thing + " lc"} thing={thing} />;
            }
            var row = <div className="requantifierRow" key={thing + " row"}><div className="quantity" key={thing + " left"}>{this.state.leftCounts[thing]}</div>
                {checkbox}
                <input className="requantify" type="button" value={this.state.rightCounts[thing] > 100 ? "<<100" : "<< all"} onClick={(event) => this.change(event.target.getAttribute("thing"), -100)} key={thing + " -100"} thing={thing} />
                <input className="requantify" type="button" value="<< 10" onClick={(event) => this.change(event.target.getAttribute("thing"), -10)} key={thing + " -10"} thing={thing} />
                <input className="requantify" type="button" value="<< 1" onClick={(event) => this.change(event.target.getAttribute("thing"), -1)} key={thing + " -1"} thing={thing} />
                <div className={"card " + this.props.displays[thing].type} key={thing + " card"}>{this.props.displays[thing].text}</div>
                <input className="requantify" type="button" value="1 >>" onClick={(event) => this.change(event.target.getAttribute("thing"), 1)} key={thing + " +1"} thing={thing} />
                <input className="requantify" type="button" value="10 >>" onClick={(event) => this.change(event.target.getAttribute("thing"), 10)} key={thing + " +10"} thing={thing} />
                <input className="requantify" type="button" value={this.state.leftCounts[thing] > 100 ? "100>>" : "all >>"} onClick={(event) => this.change(event.target.getAttribute("thing"), 100)} key={thing + " +100"} thing={thing} />
                < div className="quantity" key={thing + " right"}>{this.state.rightCounts[thing]}</div></div>;
            rows.push(row);
        }
        return <div className="screencover"><div className="requantifier"><div className="requantifierHeaderRow"><div className="requantifierLeftColumnHeader">{this.props.leftHeader}</div><div className="requantifierHeaderSpacer"><input type='button' disabled={!this.checkrules()} onClick={() => this.done()} value="Done" /></div><div className="requantifierRightColumnHeader">{this.props.rightHeader}</div></div>{rows}</div></div>;
    }
}