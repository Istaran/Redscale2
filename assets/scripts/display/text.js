registerDisplay('text', (frame, index, display) => {
    return <TextRenderer key={frame + '-' + index} text={display.text} pause={display.pause || 0} style={display.style} queue={gameDisplayer.animators} frame={frame} />
});

class TextRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.props.queue.push(this);
        this.state = { remainingTime: this.props.pause, animationStarted: false };
    }

    animate() {
        if (!this.state.animationStarted) {
            this.setState({animationStarted: true});
            return;
        }
        if (this.animationDone()) {
            return;
        }
        this.setState((state, props) => { return { remainingTime: state.remainingTime - 25}});        
    }

    animationDone() { return this.state.remainingTime <= 0; }

    render() {        
        let self = this;
        return this.state.animationStarted && <div className="textControl">{self.props.text}</div>;
    }
}