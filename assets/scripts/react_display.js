var pusher;

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

var gameDisplayerControlMap = {};
var gameDisplayerDisplayMap = {};
var gameDisplayerStatusMap = {};
function registerControl(name, templateFunction) {
    gameDisplayerControlMap[name] = templateFunction;
}
function registerDisplay(name, templateFunction) {
    gameDisplayerDisplayMap[name] = templateFunction;
}
function registerStatus(name, templateFunction) {
    gameDisplayerStatusMap[name] = templateFunction;
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
            let statusDisplay = !self.state.gameState.display ? null :            
            <div className='statusDisplay'>{
                self.state.gameState.display.map((display, index) => {
                let key = "display_" + frame + "_" + index;
                if(!gameDisplayerDisplayMap[display.type]) return null;
                return gameDisplayerDisplayMap[display.type](frame, index, display);
            })}</div>;
            let leftStatus = !self.state.gameState.leftStatus ? null :
            <div  className='leftStatus'>{
                self.state.gameState.leftStatus.lines.map((line, index) => {
                if(!gameDisplayerStatusMap[line.type]) return null;
                return gameDisplayerStatusMap[line.type]("left", index, line);
            })}</div>;
            let rightStatus = !self.state.gameState.rightStatus ? null :
            <div className='rightStatus'>{
             self.state.gameState.rightStatus.lines.map((line, index) => {
                if(!gameDisplayerStatusMap[line.type]) return null;
                return gameDisplayerStatusMap[line.type]("right", index, line);
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

    fetch('/list', {
    method: 'get'
}).then(function (response) {
    return response.json();
}).then(function (data) {
    gameDisplayer.setState({ saveList: data, gameState: null });
}).catch(function (err) {
    setError();
});

