class Loader extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(event) {
        GameDisplayer.saveSlot = this.props.slot;
        getStatus();
        Widget.close();
    }

    render() {
        return <div className='save' onClick={(event) => this.onClick(event)}>{this.props.text}</div>;
    }
}