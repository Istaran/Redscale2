
var Pusher = require('pusher');
var fs = require('fs');
var cache = require('./cache');

var pusherConfig = null;
var pusher = null;

var motdFD = fs.openSync('./data/motd.txt', 'r');
var motd = fs.readFileSync(motdFD, {encoding: 'utf8'});

if (fs.existsSync('private/config/pusher-config.json')) {
    var pusherConfigString = fs.readFileSync('private/config/pusher-config.json', 'utf8');
    console.log(`Configuring Pusher: ${pusherConfigString}`);
    pusherConfig = JSON.parse(pusherConfigString);

    pusher = new Pusher({
        appId: pusherConfig.appId,
        key: pusherConfig.key,
        secret: pusherConfig.secret,
        cluster: pusherConfig.cluster,
        encrypted: true
    });

    pusher.trigger('Redscale_main_chat', 'chat message', {
        "message": "Server was restarted",
        "timestamp": Date.now(),
        "type":"system"
    });
    pusher.trigger('Redscale_main_chat', 'chat message', {
        "message": motd,
        "type":"system"
    });
}

var chatFD = fs.openSync('./data/chat_main.log', 'a+');

var chatArchive = fs.readFileSync(chatFD, {encoding: 'utf8'}).split('\n');
while (chatArchive.length > 10000)
  chatArchive.shift();

var chatStream = fs.createWriteStream('', { fd: chatFD });
// TODO: separate by channel, private messages

let sendChat = function (user, message, debug) {
    let data = { username: user.displayName, message: message, timestamp: Date.now(), userid: user.id };
    console.log(JSON.stringify(data));
    if (pusher) 
        pusher.trigger('Redscale_main_chat', 'chat message', data);
    chatArchive.push(JSON.stringify(data));
		  while (chatArchive.length > 10000)
			  chatArchive.shift();
    chatStream.write(JSON.stringify(data) + '\n');

};

let getChats = function (user) {
    if (pusherConfig) {
        return [{
            key: pusherConfig.key,
            cluster: pusherConfig.cluster,
        }].concat(chatArchive.map((line) => {
            var chatLine = line ? JSON.parse(line) : undefined;
            if(chatLine && chatLine.userid && chatLine.userid == user.id)
                chatLine.type = "self";
            return chatLine;
        }))
        .concat({'message': motd,
        "type":"system"});
    } else {
        return null;
    }
};

module.exports = {
	sendChat: sendChat,
	getChats: getChats
};