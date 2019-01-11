Pusher.logToConsole = true;

var pusher = new Pusher('91450cc1727e582f15c1', {
  cluster: 'us2',
  forceTLS: true
});

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
		body: JSON.stringify({ 'body': (this.props.username + '\t' + chatText.value) })
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
				</div>);
	}
}

class ActButton extends React.Component {
	constructor(props) {
		super(props);
	};
	
	takeAction = function() {
		let self=this;
		fetch('/act', {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify({ 'body': { 'verb':self.props.verb, 'details':self.props.details, 'username':self.props.parent.state.username }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
				self.props.parent.setState({gameState: data});
			  });
	}
	
	render() {
		return <input type='button' className='actButton' onClick={(event)=>this.takeAction(event)} value={this.props.display} />;
	}
}



class Navigator extends React.Component {
	constructor(props) {
		super(props);
	};
	
	navigate(event, dir) {
		let gameDisp = this.props.parent;
		let details = this.props.details[dir];
		if (details) {
			fetch('/act', {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify({ 'body': { 'verb':'travel', 'details':details, 'username':gameDisp.state.username }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
				gameDisp.setState({gameState: data});
			  });
		}
	}
	
	render() {
		let upColor = (this.props.details.up) ? "skyblue" : "slateblue";
		let upColor2 = (this.props.details.up) ? "white" : "darkgray";
		let northColor = (this.props.details.north) ? "red" : "darkred";
		let westColor = (this.props.details.west) ? "lightgray" : "darkgray";
		let specialColor = (this.props.details.special) ? "lightgray" : "white";
		let eastColor = (this.props.details.east) ? "lightgray" : "darkgray";
		let southColor = (this.props.details.south) ? "lightgray" : "darkgray";
		let downColor = (this.props.details.down) ? "peru" : "saddlebrown";
		let downColor2 = (this.props.details.down) ? "lime" : "green";
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
		</defs>
		<polygon points="0,73 0,0 99,0 99,73 75,22 25,22" fill="url(#skyGradient)" stroke="gray" strokeWidth="1" onClick={(event) => this.navigate(event, 'up')}/>
		<polygon points="50,22 40,63 50,58 60,63" fill={northColor} stroke="gray" strokeWidth="1" onClick={(event) => this.navigate(event, 'north')}/>
		<polygon points="0,73 40,63 35,73 40,83" fill={westColor} stroke="gray" strokeWidth="1" onClick={(event) => this.navigate(event, 'west')}/>
		<circle cx='50' cy='73' r='10' fill={specialColor} strokeWidth="0" onClick={(event) => this.navigate(event, 'special')}/>
		<polygon points="99,73 60,63 64,73 60,83" fill={eastColor} stroke="gray" strokeWidth="1" onClick={(event) => this.navigate(event, 'east')}/>
		<polygon points="50,122 40,83 50,87, 60,83" fill={southColor} stroke="gray" strokeWidth="1" onClick={(event) => this.navigate(event, 'south')}/>
		<polygon points="0,73 0,144 99,144, 99,73 75,122 25,122" fill="url(#groundGradient)" stroke="gray" strokeWidth="1" onClick={(event) => this.navigate(event, 'down')}/>

		</svg>;
	}
	
}

class GameDisplayer extends React.Component {
	constructor(props) {
		super(props);
		var log = [];
		for (var i = 0; i < 100; i++) { log.push(''); }; // Default chat log to empty
		this.state = {
		  username: null,
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
	
  
	handleUsernameKeyUp(event) {
		var self = this;
		if (event.keyCode === 13) {
			event.preventDefault();
			
			var username =  document.getElementById('usernameInput').value;
			self.setState( {username: username });
			
			var channel = pusher.subscribe('Redscale_main_chat');
			channel.bind('chat message', self.pushTextToChatLog.bind(self));
			
			fetch('/chat', {
				method: 'get'
			}).then (function(response) {
				return response.json();
			}).then(function(chatlog) {
				if (chatlog && chatlog.length) {
					
					var newLog = self.state.chatLog.slice();
					chatlog.forEach(function (data) {
						newLog.shift();
						var message = data.username ? (data.username + '> ' + data.message) : data.message;
						newLog.push(message);
					});
					self.setState({chatLog: newLog});
				
				}
			});
			
			fetch('/act', {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify({ 'body': { 'verb':'status', 'username':username }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
				self.setState({gameState: data});
			  });

		}	
	}

	
	render() {
		let self = this;
		
		if (!this.state.username) {
			return (<div>Username:<input type='textbox' id='usernameInput' className='usernameInput' onKeyUp={(event) => this.handleUsernameKeyUp(event)}/></div>);
		} else if (this.state.gameState) {
			let controlTable = this.state.gameState.controls.map((column, colIndex) => {
				let controlColumn = column.map((control, rowIndex) => {
					switch (control.type) {
						case 'actButton': 
						return <ActButton parent={self} key={colIndex * 10 + rowIndex} display={control.display} verb={control.verb} details={control.details} />;
						case 'navigator':
						return <Navigator parent={self} key={colIndex * 10 + rowIndex} details={control.details} />;
						default:
						return '';
					}
				});
				return <div key={colIndex} className='controlColumn'>{controlColumn}</div>
			});			
			return (<div><div>{this.state.gameState.status}</div><div className='controlTable'>{controlTable}</div><ChatDisplayer chatLog={this.state.chatLog} username={this.state.username} /></div>);				
		} else {
			
		return (<div><div>Welcome, {this.state.username}. Please wait while we load your game state.</div><ChatDisplayer chatLog={this.state.chatLog} username={this.state.username} /></div>);
		}
	}
}

//-------------------------------------------------------//

ReactDOM.render(
  <GameDisplayer />,
  document.getElementById('reactroot')
);
