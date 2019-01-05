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
			return (<input type='textbox' id='usernameInput' className='usernameInput' onKeyUp={(event) => this.handleUsernameKeyUp(event)}></input>);
		} else if (this.state.gameState) {
			let controlTable = this.state.gameState.controls.map((column, colIndex) => {
				let controlColumn = column.map((control, rowIndex) => {
					switch (control.type) {
						case 'actButton': 
						return <ActButton parent={self} key={colIndex * 10 + rowIndex} display={control.display} verb={control.verb} details={control.details} />;
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
