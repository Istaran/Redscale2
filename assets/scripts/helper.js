class HelpDisplayer extends React.Component {    
	constructor(props) {
		super(props);
		HelpDisplayer.instance = this;
		this.state = {help: null};
		this.oldHelp = null;
	}
	
	render() {
		if (this.state.help) {
			this.oldHelp = this.state.help;
			return <div className='div-help'>{this.state.help}</div>;
		}
		if (this.oldHelp) {
		return <div className='div-unhelp'>{this.oldHelp}</div>;
		}
		return null;
	}
}

function setHelp(help) {
    if (HelpDisplayer.instance) {
        HelpDisplayer.instance.setState({help: help});
    }
}