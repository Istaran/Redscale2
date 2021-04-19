function setGameState(data) {
    GameDisplayer.Instance.setState(
        { 
            frame: GameDisplayer.frame++, 
            animationDone: false,
            gameState: data
        });
}

function setError() {
    GameDisplayer.Instance.setState(
        { 
            frame: GameDisplayer.frame++, 
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
        body: JSON.stringify({ 'body': { 'verb': 'status', 'slot': GameDisplayer.saveSlot } })
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        setGameState(data);
    }).catch(function (err) {
        setError();
    });
}

class GameDisplayer extends React.Component {
	constructor(props) {
        super(props);
        GameDisplayer.Instance = this;
        var log = [];
        var mLog = [];
        for (var i = 0; i < 100; i++) { log.push(''); mLog.push({})}; // Default chat log to empty
        GameDisplayer.animators = [];
		this.state = {
          chatLog: log,
          markupLog: mLog,
		  gameState: null,
          frame: GameDisplayer.frame,
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
            if (GameDisplayer.animators.length) {
                GameDisplayer.animators[0].animate();
                if (GameDisplayer.animators[0].animationDone())
                {
                    GameDisplayer.animators.shift();
                    this.setState({animationDone: (GameDisplayer.animators.length == 0)});
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
        } else if (data.type == 'self' || (GameDisplayer.userid && data.userid == GameDisplayer.userid)) {
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

        if (this.state.gameState) {
            if (this.state.gameState.profile.darkTheme) {
                document.body.className = "darktheme";
            } else {
                document.body.className = "lighttheme";
            }
            if (!GameDisplayer.userid && this.state.gameState.id) GameDisplayer.userid = this.state.gameState.id;
            let controlTable = [];
            if (this.state.frame != GameDisplayer.frame) {                
                GameDisplayer.formData = {};
                GameDisplayer.animators = [];
                this.state.animationDone = false;
                this.state.frame = GameDisplayer.frame;
            }
            if (this.state.animationDone) {
                controlTable = this.state.gameState.controls.map((column, colIndex) => {
                    let controlColumn = [];
                    if (column) {
                        controlColumn = column.map((control, rowIndex) => {
                            if(!GameDisplayer.ControlMap[control.type]) return null;
                            return GameDisplayer.ControlMap[control.type](colIndex, rowIndex, control);
                        });
                    }
                    return <div key={colIndex} className='controlColumn'>{controlColumn}</div>
                });
            }
            let statusDisplay = !self.state.gameState.display ? null :            
            <div className='statusDisplay'>{
                self.state.gameState.display.map((display, index) => {
                let key = "display_" + this.state.frame + "_" + index;
                if(!GameDisplayer.DisplayMap[display.type]) return null;
                return GameDisplayer.DisplayMap[display.type](this.state.frame, index, display);
            })}</div>;
            let leftStatus = !self.state.gameState.leftStatus ? null :
            <div  className='leftStatus'>{
                self.state.gameState.leftStatus.lines.map((line, index) => {
                if(!GameDisplayer.StatusMap[line.type]) return null;
                return GameDisplayer.StatusMap[line.type]("left", index, line);
            })}</div>;
            let rightStatus = !self.state.gameState.rightStatus ? null :
            <div className='rightStatus'>{
             self.state.gameState.rightStatus.lines.map((line, index) => {
                if(!GameDisplayer.StatusMap[line.type]) return null;
                return GameDisplayer.StatusMap[line.type]("right", index, line);
            })}</div>;
            return (<div>
                <div className='topbar'>
                    <div className='topleft' />
                    <div className='titlebar'>{this.state.gameState.title}</div>
                    <div className='topright' />
                </div>
                <div className='statusWrapper'>{leftStatus}{statusDisplay}{rightStatus}</div>
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

                        GameDisplayer.pusher = new Pusher(config.key, {
                            cluster: config.cluster,
                            forceTLS: true
                        });
                        var channel = GameDisplayer.pusher.subscribe('Redscale_main_chat');
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

GameDisplayer.frame = 0;
GameDisplayer.ControlMap = {};
GameDisplayer.DisplayMap = {};
GameDisplayer.StatusMap = {};
GameDisplayer.Widget = [];
GameDisplayer.formData = {};

function registerControl(name, templateFunction) {
    GameDisplayer.ControlMap[name] = templateFunction;
}
function registerDisplay(name, templateFunction) {
    GameDisplayer.DisplayMap[name] = templateFunction;
}
function registerStatus(name, templateFunction) {
    GameDisplayer.StatusMap[name] = templateFunction;
}

registerControl('refresher', (colIndex, rowIndex, control) => {
    return <div className='refresher' onClick={getStatus}>&#x1f503;Refresh&#x1f503;</div>;
});
registerControl('reconnector', (colIndex, rowIndex, control) => {
    return <a href="login/google" className='refresher'>&#x1F4F6;Reconnect&#x1F4F6;</a>;
});
registerControl('itemCount', (colIndex, rowIndex, control) => {
    return <div key={colIndex * 10 + rowIndex} className="ctrlLabel">{control.display}</div>;
});
registerControl('spacer', (colIndex, rowIndex, control) => {
    return <div key={colIndex * 10 + rowIndex} className="ctrlLabel"></div>; 
});
registerStatus('text', (side, index, status) => {
    return <div key={side + '-' + index} className='statusRow' onMouseOver={() => setHelp(status.help)} onMouseOut={() => setHelp(null)}>{status.text}</div>
});

//-------------------------------------------------------//
ReactDOM.render(
    <GameDisplayer />,
    document.getElementById('reactroot')
    );

    fetch('/list', {
    method: 'get'
}).then(function (response) {
    return response.json();
}).then(function (data) {
    GameDisplayer.Instance.setState({ saveList: data, gameState: null });
}).catch(function (err) {
    setError();
});

