
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
while (chatArchive.length > 10000)
  chatArchive.shift();

var chatStream = fs.createWriteStream('', { fd: chatFD });
// TODO: separate by channel, private messages

let sendChat = function (user, message, debug) {
    let data = { username: user.displayName, message: message };
	  console.log(JSON.stringify(data));
    pusher.trigger('Redscale_main_chat', 'chat message', data);
    chatArchive.push(JSON.stringify(data));
		  while (chatArchive.length > 10000)
			  chatArchive.shift();
    chatStream.write(JSON.stringify(data) + '\n');

};

let getChats = function () {
	return chatArchive.map((line) => line ? JSON.parse(line) : undefined);
};

module.exports = {
	sendChat: sendChat,
	getChats: getChats
};