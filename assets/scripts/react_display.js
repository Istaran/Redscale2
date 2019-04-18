Pusher.logToConsole = true;

var pusher = new Pusher('91450cc1727e582f15c1', {
  cluster: 'us2',
  forceTLS: true
});

var helper;
var gameDisplayer;
var formData = {};

function getStatus() {
    fetch('/act' + location.search, {
        method: 'post',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ 'body': { 'verb': 'status' } })
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        gameDisplayer.setState({ gameState: data });
    }).catch(function (err) {
        gameDisplayer.setState({ gameState: { status: "There was an error trying to load your game. Click refresh when you want to try again. If the problem persists, email istaran@redscalesadventure.online and include your google email address for reference.", controls: [[{ type: "refresher" }]] } });
    });
}

class HelpDisplayer extends React.Component {
	constructor(props) {
		super(props);
		helper = this;
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

class ChatDisplayer extends React.Component {
	constructor(props) {
		super(props);
	}
		
	handleClickSend = function() {
		var chatText = document.getElementById('chatInput');
		fetch('/chat', {
		method: 'post',
		headers: {
		   "Content-Type": "application/json; charset=utf-8",
		},
		body: JSON.stringify({ 'body': chatText.value })
	  }).then(function(response) {
		return response.text();
	  }).then(function(data) {
		// no-op
	  });
	  chatText.value = "";
	}
	
	handleChatKeyUp = function (event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			this.handleClickSend();
		}	
	};
	
	render() {
		let chatDisplay = this.props.chatLog.map((text, index) => { return (<tr key={index}><td>{text}</td></tr>); });
		
		return (
				<div id='chatDiv' className='div-bottom'>
					<div id='chatScroll' className='div-scroll-bottom'>
						<table id='chatlist' className='chatlist'>
							<tbody id='chatlistbody'>{chatDisplay}</tbody>
						</table>
					</div><div id='chatInputSection' className='chatInputSection'>
						<input type='textbox' id='chatInput' className='chatInput' onKeyUp={(event) => this.handleChatKeyUp(event)}></input>
						<input type='button' id='chatSend' className='chatSend' onClick={(event) => this.handleClickSend(event)} value='Send'></input>
					</div>
					<HelpDisplayer />
				</div>);
	}
}

class ActButton extends React.Component {
	constructor(props) {
		super(props);
	};
	
	takeAction = function() {
        let self = this;
        helper.setState({ help: null });
		fetch('/act' + location.search, {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'id': self.props.id, 'data': formData }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
				self.props.parent.setState({gameState: data});
			  });
	}
	
	render() {
        return <input type='button' className='actButton' onClick={(event) => this.takeAction(event)} value={this.props.display} disabled={!this.props.enabled} onMouseOver={(event) => helper.setState({ help: this.props.help })} onMouseOut={(event) => helper.setState({ help: null })} />;
	}
}


class Card extends React.Component {
    constructor(props) {
        super(props);
    };

    takeAction = function () {
        let self = this;
        helper.setState({ help: null });
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'id': self.props.id } })
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.props.parent.setState({ gameState: data });
        }).catch(function (err) {
            gameDisplayer.setState({ gameState: { status: "There was an error trying to do that. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.", controls: [[{ type: "refresher" }]] } });
        });
    }

    render() {
        let display = this.props.display;
        if (this.props.count) display += "\n\nCopies: " + this.props.count; // TODO: beautify how we display this.
        return <div className={'card ' + this.props.verb} onClick={(event) => this.takeAction(event)} disabled={!this.props.enabled} onMouseOver={(event) => helper.setState({ help: this.props.help })} onMouseOut={(event) => helper.setState({ help: null })} >{ display }</div >;
    }
}


class Navigator extends React.Component {
	constructor(props) {
		super(props);
	};
	
	navigate(event, dir) {
		let gameDisp = this.props.parent;
        let id = this.props.id;
        helper.setState({ help: null });
		if (this.props.details[dir]) {
            fetch('/act' + location.search, {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
                body: JSON.stringify({ 'body': { 'verb': 'travel', 'id': id, 'sub': dir }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
				gameDisp.setState({gameState: data});
              }).catch(function (err) {
                  gameDisplayer.setState({ gameState: { status: "There was an error trying to go there. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.", controls: [[{ type: "refresher" }]] } });
              });
		}
	}
	
    render() {
        let backgroundColor = "silver";
        let compassLight = "white";
        let compassDark = "black";
        let compassDisabled = "dimgray";
		let upColor = (this.props.details.up) ? "skyblue" : "slateblue";
		let upColor2 = (this.props.details.up) ? "white" : "darkgray";
        let northColor = (this.props.details.north) ? "red" : "firebrick";
        let northColor2 = (this.props.details.north) ? "darkred" : "firebrick";
        let westColor = (this.props.details.west) ? compassLight : compassDisabled;
        let westColor2 = (this.props.details.west) ? compassDark : compassDisabled;
        let specialColor = (this.props.details.special) ? compassLight : backgroundColor;
        let specialColor2 = (this.props.details.special) ? compassDark : backgroundColor;
        let eastColor = (this.props.details.east) ? compassLight : compassDisabled;
        let eastColor2 = (this.props.details.east) ? compassDark : compassDisabled;
        let southColor = (this.props.details.south) ? compassLight : compassDisabled;
        let southColor2 = (this.props.details.south) ? compassDark : compassDisabled;
        let nwColor = ( this.props.details.nw ) ? compassLight : compassDisabled;
        let nwColor2 = ( this.props.details.nw ) ? compassDark : compassDisabled;
        let neColor = ( this.props.details.ne ) ? compassLight : compassDisabled;
        let neColor2 = ( this.props.details.ne ) ? compassDark : compassDisabled;
        let swColor = ( this.props.details.sw ) ? compassLight : compassDisabled;
        let swColor2 = ( this.props.details.sw ) ? compassDark : compassDisabled;
        let seColor = ( this.props.details.se ) ? compassLight : compassDisabled;
        let seColor2 = ( this.props.details.se ) ? compassDark : compassDisabled;
		let downColor = (this.props.details.down) ? "peru" : "saddlebrown";
		let downColor2 = (this.props.details.down) ? "lime" : "green";
		
		let upHelp = (this.props.details.up) ? "Go up.\n" + this.props.details.up : "You can't go up from here.";
		let northHelp = (this.props.details.north) ? "Go north.\n" + this.props.details.north : "You can't go north from here.";
		let westHelp = (this.props.details.west) ? "Go west.\n" + this.props.details.west : "You can't go west from here.";
		let specialHelp = (this.props.details.special) ? this.props.details.special : null;
		let eastHelp = (this.props.details.east) ? "Go east.\n" + this.props.details.east : "You can't go east from here.";
		let southHelp = (this.props.details.south) ? "Go south.\n" + this.props.details.south : "You can't go south from here.";
		let downHelp = (this.props.details.down) ? "Go down.\n" + this.props.details.down : "You can't go down from here.";

        let nwHelp = (this.props.details.nw) ? "Go northwest.\n" + this.props.details.nw : "You can't go northwest from here.";
        let neHelp = (this.props.details.ne) ? "Go northeast.\n" + this.props.details.nw : "You can't go northeast from here.";
        let swHelp = (this.props.details.sw) ? "Go southwest.\n" + this.props.details.nw : "You can't go southwest from here.";
        let seHelp = (this.props.details.se) ? "Go southeast.\n" + this.props.details.nw : "You can't go southeast from here.";


		return <svg className='navigator' width='100' height='145'>
		    <defs>
			    <linearGradient id="groundGradient" x1="0" x2="0" y1="0" y2="1">
				    <stop offset="50%" stopColor={downColor2}/>
				    <stop offset="95%" stopColor={downColor}/>
			    </linearGradient>
			    <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
				    <stop offset="5%" stopColor={upColor2}/>
				    <stop offset="50%" stopColor={upColor}/>
			    </linearGradient>
                <linearGradient id="specialGradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="15%" stopColor={specialColor} />
                    <stop offset="85%" stopColor={specialColor2} />
                </linearGradient>
            </defs>
            <polygon points="0,73 0,0 99,0 99,73" fill="url(#skyGradient)" onClick={(event) => this.navigate(event, 'up')} onMouseOver={(event) => helper.setState({ help: upHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="0,73 0,144 99,144, 99,73" fill="url(#groundGradient)" onClick={(event) => this.navigate(event, 'down')} onMouseOver={(event) => helper.setState({ help: downHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <circle cx='50' cy='73' r='50' fill={backgroundColor} />
            <line x1="11.3" y1="50.5" x2="7" y2="48" stroke="black" strokeWidth="1" />
            <line x1="11.3" y1="95.5" x2="7" y2="98" stroke="black" strokeWidth="1" />
            <line x1="88.7" y1="50.5" x2="93" y2="48" stroke="black" strokeWidth="1" />
            <line x1="88.7" y1="95.5" x2="93" y2="98" stroke="black" strokeWidth="1" />
            <line x1="27.5" y1="34.3" x2="25" y2="30" stroke="black" strokeWidth="1" />
            <line x1="27.5" y1="111.7" x2="25" y2="116" stroke="black" strokeWidth="1" />
            <line x1="72.5" y1="34.3" x2="75" y2="30" stroke="black" strokeWidth="1" />
            <line x1="72.5" y1="111.7" x2="75" y2="116" stroke="black" strokeWidth="1" />
            <line x1="6.5" y1="61.4" x2="2" y2="60" stroke="black" strokeWidth="1" />
            <line x1="6.5" y1="84.6" x2="2" y2="86" stroke="black" strokeWidth="1" />
            <line x1="93.5" y1="61.4" x2="98" y2="60" stroke="black" strokeWidth="1" />
            <line x1="93.5" y1="84.6" x2="98" y2="86" stroke="black" strokeWidth="1" />
            <line x1="38.4" y1="29.5" x2="37" y2="25" stroke="black" strokeWidth="1" />
            <line x1="38.4" y1="116.5" x2="37" y2="121" stroke="black" strokeWidth="1" />
            <line x1="61.6" y1="29.5" x2="63" y2="25" stroke="black" strokeWidth="1" />
            <line x1="61.6" y1="116.5" x2="63" y2="121" stroke="black" strokeWidth="1" />
            <polygon points="15,38 40,63 50,53" fill={nwColor} onClick={(event) => this.navigate(event, 'nw')} onMouseOver={(event) => helper.setState({ help: nwHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="15,38 30,73 40,63" fill={nwColor2} onClick={(event) => this.navigate(event, 'nw')} onMouseOver={(event) => helper.setState({ help: nwHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="15,108 30,73 40,83" fill={swColor} onClick={(event) => this.navigate(event, 'sw')} onMouseOver={(event) => helper.setState({ help: swHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="15,108 40,83 50,93" fill={swColor2} onClick={(event) => this.navigate(event, 'sw')} onMouseOver={(event) => helper.setState({ help: swHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="85,38 60,63 50,53" fill={neColor} onClick={(event) => this.navigate(event, 'ne')} onMouseOver={(event) => helper.setState({ help: neHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="85,38 70,73 60,63" fill={neColor2} onClick={(event) => this.navigate(event, 'ne')} onMouseOver={(event) => helper.setState({ help: neHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="85,108 70,73 60,83" fill={seColor} onClick={(event) => this.navigate(event, 'se')} onMouseOver={(event) => helper.setState({ help: seHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="85,108 60,83 50,93" fill={seColor2} onClick={(event) => this.navigate(event, 'se')} onMouseOver={(event) => helper.setState({ help: seHelp })} onMouseOut={(event) => helper.setState({ help: null })} />


            <polygon points="50,22 40,63 50,58" fill={northColor} onClick={(event) => this.navigate(event, 'north')} onMouseOver={(event) => helper.setState({ help: northHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <polygon points="50,22 50,58 60,63" fill={northColor2} onClick={(event) => this.navigate(event, 'north')} onMouseOver={(event) => helper.setState({ help: northHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
		    <polygon points="0,73 40,63 35,73" fill={westColor} onClick={(event) => this.navigate(event, 'west')} onMouseOver={(event)=>helper.setState({help:westHelp})} onMouseOut={(event)=>helper.setState({help:null})} />
            <polygon points="0,73 35,73 40,83" fill={westColor2} onClick={(event) => this.navigate(event, 'west')} onMouseOver={(event) => helper.setState({ help: westHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
            <circle cx='50' cy='73' r='10' fill="url(#specialGradient)" onClick={(event) => this.navigate(event, 'special')} onMouseOver={(event)=>helper.setState({help:specialHelp})} onMouseOut={(event)=>helper.setState({help:null})} />
		    <polygon points="99,73 60,63 64,73" fill={eastColor} onClick={(event) => this.navigate(event, 'east')} onMouseOver={(event)=>helper.setState({help:eastHelp})} onMouseOut={(event)=>helper.setState({help:null})} />
            <polygon points="99,73 64,73 60,83" fill={eastColor2} onClick={(event) => this.navigate(event, 'east')} onMouseOver={(event) => helper.setState({ help: eastHelp })} onMouseOut={(event) => helper.setState({ help: null })} />
		    <polygon points="50,122 40,83 50,87" fill={southColor} onClick={(event) => this.navigate(event, 'south')} onMouseOver={(event)=>helper.setState({help:southHelp})} onMouseOut={(event)=>helper.setState({help:null})} />
            <polygon points="50,122 50,87 60,83" fill={southColor2} onClick={(event) => this.navigate(event, 'south')} onMouseOver={(event) => helper.setState({ help: southHelp })} onMouseOut={(event) => helper.setState({ help: null })} />


		</svg>;
	}	
}

class TextInputer extends React.Component {
    constructor(props) {
        super(props);

        formData[this.props.name] = this.props.default;
    }

    purgeCharacters(event) {
        event.target.value = event.target.value.replace(/[^a-zA-Z0-9 ]/, '');

        formData[this.props.name] = event.target.value || this.props.default;
    }

    render() {
        return <input type="text" placeholder={this.props.default} onInput={(event) => this.purgeCharacters(event)} />;
    }
}

class LeftStatus extends React.Component {
	constructor(props) {
		super(props);
		
	}
	
    render() {
        if (!this.props.source || !this.props.source.lines) return <div display='none'></div>;
		var statuslines = this.props.source.lines.map((line, lineIdx) => {
			return <div key={lineIdx} className='statusRow' onMouseOver={(event)=>helper.setState({help:line.help})} onMouseOut={(event)=>helper.setState({help:null})}>{line.text}</div>
		});
		return <div className='leftStatus'>{statuslines}</div>;
	}
}


class Refresher extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className='refresher' onClick={getStatus}>&#x1f503;Refresh&#x1f503;</div>;
    }
}

class Reconnector extends React.Component {
    constructor(props) {
        super(props);
    }

    

    render() {
        return <a href="login/google" className='refresher'>&#x1F4F6;Reconnect&#x1F4F6;</a>;
    }
}


class GameDisplayer extends React.Component {
	constructor(props) {
        super(props);
        gameDisplayer = this;
		var log = [];
		for (var i = 0; i < 100; i++) { log.push(''); }; // Default chat log to empty
		this.state = {
		  chatLog: log,
		  gameState: null,
		};
	}
  
  	pushTextToChatLog = function(data) {
	  var newLog = this.state.chatLog.slice();
	  newLog.shift();
	  var message = data.username ? (data.username + '> ' + data.message) : data.message;
	  newLog.push(message);
	  this.setState({chatLog: newLog});
	};
	
	render() {
		let self = this;
        formData = {}; // Caution: if this causes unexpected rerenderers I might have issues with setting this here.
        if (this.state.gameState) {
            let controlTable = this.state.gameState.controls.map((column, colIndex) => {
                let controlColumn = column.map((control, rowIndex) => {
                    switch (control.type) {
                        case 'actButton':
                            return <ActButton parent={self} key={colIndex * 10 + rowIndex} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} />;
                        case 'card':
                            return <Card parent={self} key={colIndex * 10 + rowIndex} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} count={control.count} />;
                        case 'navigator':
                            return <Navigator parent={self} key={colIndex * 10 + rowIndex} details={control.sub} id={control.id} />;
                        case 'textBox':
                            return <TextInputer parent={self} key={colIndex * 10 + rowIndex} id={control.id} default={control.default} name={control.name} />;
                        case 'refresher':
                            return <Refresher />;
                        case 'reconnector':
                            return <Reconnector />;
                        default:
                            return '';
                    }
                });
                return <div key={colIndex} className='controlColumn'>{controlColumn}</div>
            });
            return (<div><div className='statusWrapper'><LeftStatus source={this.state.gameState.leftStatus} /><div className='statusDisplay'>{this.state.gameState.status}</div></div><div className='controlTable'>{controlTable}</div><ChatDisplayer chatLog={this.state.chatLog} /></div>);
        } else {		
		    return (<div><div>Welcome, {name}. Please wait while we load your game state.</div><ChatDisplayer chatLog={this.state.chatLog} /></div>);
		}
	}
}

//-------------------------------------------------------//

ReactDOM.render(
  <GameDisplayer />,
  document.getElementById('reactroot')
);

getStatus();