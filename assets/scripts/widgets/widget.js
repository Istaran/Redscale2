class Widget extends React.Component {
    constructor(props, type) {
        super(props);
        this.type = type;
        this.state = {
            mode: 'normal'
        }
    }

    static openWidget = null;

    open() {
        let self = this;
        if (Widget.openWidget) {
            Widget.openWidget.setState({mode: 'normal'});
        }
        Widget.openWidget = self;
        self.setState({mode: 'opened'});
    }
    
    close() {
        let self = this;
        self.setState({mode: 'normal'});
        Widget.openWidget = null;
    }

    render() {        
        let self = this;
        if (this.state.mode == 'opened') {
            let internal = self.renderInternal();
            return <div class={`${self.type}-icon widget-icon widget-state-${this.state.mode}`} onClick={() => self.close()}>
                    <div class='widget-modal' onClick='(e)=>e.stopPropagation()' >{internal}</div>
                </div>;
        }
        return <div class={`${self.type}-icon widget-icon widget-state-${this.state.mode}`} onClick={() => self.open()} />;
    }
}