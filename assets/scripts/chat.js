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
		let chatDisplay = this.props.chatLog.map((text, index) => { 
             return (<tr key={index}><td style={this.props.markupLog[index]}>{text}</td></tr>); 
            });
		
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