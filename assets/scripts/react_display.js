var pusher;

var helper;
var gameDisplayer;
var formData = {};
var saveSlot = 0;
var userid;
var frame = 0;

function setGameState(data) {
    gameDisplayer.setState(
        { 
            frame: frame++, 
            animationDone: false,
            gameState: data
        });
}

function setError() {
    gameDisplayer.setState(
        { 
            frame: frame++, 
            animationDone: true,
            gameState: { 
                display: [
                    { 
                        type: "text", 
                        text: "There was an error trying to do that. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.",
                        pause: 0
                    }
                ], 
                controls: [[{ type: "refresher" }]] 
            } 
        });
}

function getStatus() {
    fetch('/act' + location.search, {
        method: 'post',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ 'body': { 'verb': 'status', 'slot': saveSlot } })
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        setGameState(data);
    }).catch(function (err) {
        setError();
    });
}

function getSaveList() {
    fetch('/list', {
        method: 'get'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        gameDisplayer.setState({ saveList: data, gameState: null });
    }).catch(function (err) {
        setError();
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

class ActButton extends React.Component {
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
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'slot': saveSlot, 'id': self.props.id, 'data': formData } })
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
        return <input type='button' className='actButton' style={{ width: width }} onClick={(event) => this.takeAction(event)} value={this.props.display} disabled={!this.props.enabled} onMouseOver={(event) => helper.setState({ help: this.props.help })} onMouseOut={(event) => helper.setState({ help: null })} />;
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
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'slot': saveSlot, 'id': self.props.id } })
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        let display = this.props.display;
        let stacks = [];
        for (var i = 1; i < this.props.count; i++) {
            stacks.push(<div className={'stack ' + this.props.verb} key={'stack ' + i} />);
        }
        return <div className='cardBox'><div className={'card ' + this.props.verb} onClick={(event) => this.takeAction(event)} disabled={!this.props.enabled} onMouseOver={(event) => helper.setState({ help: this.props.help })} onMouseOut={(event) => helper.setState({ help: null })} >{display}</div>{stacks}</div>;
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
            if (line.isPercent) {
                return <PercentBar  key={lineIdx} leftVal={line.leftVal} rightVal={line.rightVal} leftColor={line.leftColor} rightColor={line.rightColor} totalWidth='200' height='18px' text={line.text}></PercentBar>
            }
			return <div key={lineIdx} className='statusRow' onMouseOver={(event)=>helper.setState({help:line.help})} onMouseOut={(event)=>helper.setState({help:null})}>{line.text}</div>
		});
		return <div className='leftStatus'>{statuslines}</div>;
	}
}

class RightStatus extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        if (!this.props.source || !this.props.source.lines) return <div display='none'></div>;
        var statuslines = this.props.source.lines.map((line, lineIdx) => {
            if (line.isPercent) {
                return <PercentBar  key={lineIdx} leftVal={line.leftVal} rightVal={line.rightVal} leftColor={line.leftColor} rightColor={line.rightColor} totalWidth='200' height='18px' text={line.text}></PercentBar>
            }
            return <div key={lineIdx} className='statusRow' onMouseOver={(event) => helper.setState({ help: line.help })} onMouseOut={(event) => helper.setState({ help: null })}>{line.text}</div>
        });
        return <div className='rightStatus'>{statuslines}</div>;
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

class Loader extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(event) {
        saveSlot = this.props.slot;
        getStatus();
    }

    render() {
        return <div className='save' onClick={(event) => this.onClick(event)}>{this.props.text}</div>;
    }
}


class PercentBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {        
        let self = this;
        let left = Math.max(self.props.leftVal, 0);
        let right = Math.max(self.props.rightVal, 0);
        let multi = self.props.totalWidth / (left + right); 
        let leftWidth = multi * left;
        let rightWidth = multi * right;

        return (<div className="percentControl">
            <div className="percentLeft" style={{width: leftWidth,  height: self.props.height, backgroundColor: self.props.leftColor}}>
            </div>
            <div className="percentRight" style={{width: rightWidth,  height: self.props.height, backgroundColor: self.props.rightColor}}>
            </div>
            <div className="percentText" style={{width: self.props.totalWidth + 'px', height: self.props.height, top: 0, left: 0}}>{self.props.text}</div>
        </div>);
    }
}

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


var gameDisplayerControlMap = {};
var gameDisplayerDisplayMap = {};
function registerControl(name, templateFunction) {
    gameDisplayerControlMap[name] = templateFunction;
}
function registerDisplay(name, templateFunction) {
    gameDisplayerDisplayMap[name] = templateFunction;
}

registerControl('actButton', (colIndex, rowIndex, control) => {
    return <ActButton key={colIndex * 10 + rowIndex} extendRight={control.extendRight} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} />;
});
registerControl('card', (colIndex, rowIndex, control) => {
    return <Card key={colIndex * 10 + rowIndex} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} count={control.count} />;
});
registerControl('navigator', (colIndex, rowIndex, control) => {
    return <Navigator key={colIndex * 10 + rowIndex} details={control.sub} id={control.id} />;
});
registerControl('textBox', (colIndex, rowIndex, control) => {
    return <TextInputer key={colIndex * 10 + rowIndex} id={control.id} default={control.default} name={control.name} />;
});
registerControl('refresher', (colIndex, rowIndex, control) => {
    return <Refresher />;
});
registerControl('reconnector', (colIndex, rowIndex, control) => {
    return <Reconnector />;
});
registerControl('requantifier', (colIndex, rowIndex, control) => {
    return <Requantifier key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftCounts={control.leftCounts} leftChecks={control.leftChecks} rightCounts={control.rightCounts} displays={control.displays} id={control.id} rules={control.rules}/>;
});
registerControl('reassigner', (colIndex, rowIndex, control) => {
    return <Reassigner key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftSet={control.leftSet} rightSet={control.rightSet} displays={control.displays} id={control.id} />;
});
registerControl('recombiner', (colIndex, rowIndex, control) => {
    return <Recombiner key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftSet={control.leftSet} rightSet={control.rightSet} displays={control.displays} id={control.id} />;
});
registerControl('itemCount', (colIndex, rowIndex, control) => {
    return <div key={colIndex * 10 + rowIndex} className="ctrlLabel">{control.display}</div>;
});
registerControl('spacer', (colIndex, rowIndex, control) => {
    return <div key={colIndex * 10 + rowIndex} className="ctrlLabel"></div>; 
});
registerDisplay('text', (frame, index, display) => {
    return <TextRenderer key={key} text={display.text} pause={display.pause || 0} style={display.style} queue={self.animators} frame={self.state.frame} />
});
registerDisplay('attack', (frame, index, display) => {
    return <AttackRenderer key={key} blockWidth='10' attack={display} queue={self.animators} frame={self.state.frame}/>
});

class GameDisplayer extends React.Component {
	constructor(props) {
        super(props);
        gameDisplayer = this;
        var log = [];
        var mLog = [];
        for (var i = 0; i < 100; i++) { log.push(''); mLog.push({})}; // Default chat log to empty
        this.animators = [];
		this.state = {
          chatLog: log,
          markupLog: mLog,
		  gameState: null,
          frame: frame,
          animationDone: false
		};
	}
    
    componentDidMount() {
        this.timerID = setInterval(
            () => this.animate(),
            25
        );
    }

    componentWillUnmount() {
        if (this.timerID)
            clearInterval(this.timerID);
    }

    animate() {
        let loop = this.state.gameState && this.state.gameState.profile && this.state.gameState.profile.fastAnimations;
        for(let iterations = (loop ? 100 : 1); iterations > 0; iterations--) {
            if (this.animators.length) {
                this.animators[0].animate();
                if (this.animators[0].animationDone())
                {
                    this.animators.shift();
                    this.setState({animationDone: (this.animators.length == 0)});
                }
            } else if (!this.state.animationDone) {
                this.setState({animationDone: true});
                break;
            } else {
                break;
            }
        }
    }

    stringFromMessageData(data) {
        var datestring = data.timestamp ? new Date(data.timestamp).toLocaleString() + ": " : "";
        var message = datestring + (data.username ? (data.username + '> ' + data.message) : data.message);
        return message;
    }

    markupFromMessageData(data) {
        var markup = {};
        //color
        if (data.type == 'system') {
            markup.color = '#0088FF';
        } else if (data.type == 'self' || (userid && data.userid == userid)) {
            markup.color = '#FF4400';
        }
        return markup;
    }

  	pushTextToChatLog = function(data) {
	  var newLog = this.state.chatLog.slice();
        newLog.shift();
        newLog.push(this.stringFromMessageData(data));
      var newMLog = this.state.markupLog.slice();
      newMLog.shift();
      newMLog.push(this.markupFromMessageData(data));
      this.setState({chatLog: newLog, markupLog: newMLog});
	};
	
	render() {
		let self = this;

        formData = {}; // Caution: if this causes unexpected rerenderers I might have issues with setting this here.
        if (this.state.gameState) {
            if (this.state.gameState.profile.darkTheme) {
                document.body.className = "darktheme";
            } else {
                document.body.className = "lighttheme";
            }
            if (!userid && this.state.gameState.id) userid = this.state.gameState.id;
            let controlTable = [];
            if (this.state.frame != frame) {
                this.animators = [];
                this.state.animationDone = false;
                this.state.frame = frame;
            }
            if (this.state.animationDone) {
                controlTable = this.state.gameState.controls.map((column, colIndex) => {
                    let controlColumn = [];
                    if (column) {
                        controlColumn = column.map((control, rowIndex) => {
                            if(!gameDisplayerControlMap[control.type]) return null;
                            return gameDisplayerControlMap[control.type](colIndex, rowIndex, control);
                        });
                    }
                    return <div key={colIndex} className='controlColumn'>{controlColumn}</div>
                });
            }
            let statusDisplay = self.state.gameState.display.map((display, index) => {
                let key = "display_" + frame + "_" + index;
                if(!gameDisplayerDisplayMap[display.type]) return null;
                return gameDisplayerDisplayMap[display.type](frame, index, display);
            });
            return (<div>
                <div className='topbar'>
                    <div className='topleft' />
                    <div className='titlebar'>{this.state.gameState.title}</div>
                    <div className='topright' /></div>
                    <div className='statusWrapper'>
                        <LeftStatus source={this.state.gameState.leftStatus} />
                        <div className='statusDisplay'>{statusDisplay}</div>
                        <RightStatus source={this.state.gameState.rightStatus} />
                    </div>
                    <div className='controlTable'>{controlTable}</div>
                    <ChatDisplayer chatLog={this.state.chatLog} markupLog={this.state.markupLog}/>
                </div>);
        } else if (this.state.saveList) {
            // initialize chat
            if (!this.chatInit) {
                this.chatInit = true;

                fetch('/chat', {
                    method: 'get'
                }).then(function (response) {
                    return response.json();
                }).then(function (chatlog) {
                    if (chatlog && chatlog.length) {
                        var config = chatlog[0];

                        pusher = new Pusher(config.key, {
                            cluster: config.cluster,
                            forceTLS: true
                        });
                        var channel = pusher.subscribe('Redscale_main_chat');
                        channel.bind('chat message', self.pushTextToChatLog.bind(self));

                        var newLog = self.state.chatLog.slice(1);
                        var newMLog = self.state.markupLog.slice(1);
                        chatlog.forEach(function (data) {
                            if (data) {
                                newLog.shift();
                                newLog.push(self.stringFromMessageData(data));
                                newMLog.shift();
                                newMLog.push(self.markupFromMessageData(data));
                            }
                        });
                        self.setState({ chatLog: newLog, markupLog: newMLog });
                    } else {
                        self.setState({ chatLog: ["Local server is not configured for live chat."], markupLog: [{}]})
                    }
                });
            }

            let newSlot = 0;
            let saveTable = this.state.saveList.map((save) => {
                if (parseInt(save.slot, 10) >= newSlot) newSlot = parseInt(save.slot, 10) + 1; 
                return <Loader key={save.slot} slot={save.slot} text={save.text} />;
            });
            return <div className='saveList'>{saveTable}<Loader slot={newSlot} key={newSlot} text='Start a new game.' /></div>;
        } else {		
		    return (<div><div>Welcome, {name}. Please wait while we load your game state.</div><ChatDisplayer chatLog={this.state.chatLog}  markupLog={this.state.markupLog}/></div>);
		}
	}
}

//-------------------------------------------------------//

ReactDOM.render(
  <GameDisplayer />,
  document.getElementById('reactroot')
);

getSaveList();