
var Pusher = require('pusher');
var fs = require('fs');
var cache = require('./cache');

var pusher = new Pusher({
  appId: '612236',
  key: '91450cc1727e582f15c1',
  secret: 'f35b87227451a8912ede',
  cluster: 'us2',
  encrypted: true
});

pusher.trigger('Redscale_main_chat', 'chat message', {
  "message": "Server was restarted"
});


var chatFD = fs.openSync('./data/chat_main.log', 'a+');

var chatArchive = fs.readFileSync(chatFD, {encoding: 'utf8'}).split('\n');
while (chatArchive.length > 100)
  chatArchive.shift();

var chatStream = fs.createWriteStream('', { fd: chatFD });
// TODO: separate by channel, private messages

let sendChat = function (message, local) {
	  console.log(message);
	 var parts = message.split('\t');
	 var data = parts.length > 1 ? ({ message: parts[1], username: parts[0]}) : ({message: parts[0]});
	 if (data.message[0] == '/') {
		if (local) {
			if (data.message == "/clear cache") {
				cache.clear();
				pusher.trigger('Redscale_main_chat', 'chat message', 'Server cache was cleared');
			} 
		}
	 }else {
		  pusher.trigger('Redscale_main_chat', 'chat message', data);
		  chatArchive.push(message);
		  while (chatArchive.length > 100)
			  chatArchive.shift();
		  chatStream.write(message + '\n');
	 }
};

let getChats = function () {
	return chatArchive.map((line) => { var parts = line.split('\t'); return parts.length > 1 ? ({ message: parts[1], username: parts[0]}) : ({message: parts[0]})});;
};

module.exports = {
	sendChat: sendChat,
	getChats: getChats
};