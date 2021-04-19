registerControl('actButton', (colIndex, rowIndex, control) => {
    return <ActButton key={colIndex * 10 + rowIndex} extendRight={control.extendRight} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} />;
});

class ActButton extends React.Component {
    constructor(props) {
        super(props);
    };

    takeAction = function () {
        let self = this;
        setHelp(null);
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'slot': GameDisplayer.saveSlot, 'id': self.props.id, 'data': GameDisplayer.formData } })
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        var width = 150 + 155 * (this.props.extendRight || 0);
        return <input type='button' className='actButton' style={{ width: width }} onClick={(event) => this.takeAction(event)} value={this.props.display} disabled={!this.props.enabled} onMouseOver={(event) => setHelp(this.props.help)} onMouseOut={(event) => setHelp(null)} />;
	}
}