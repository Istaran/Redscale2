const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8161;
const chat = require('./chatserver');

const game = require('./gameengine');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/assets'));

app.post('/chat', function (req, res) {
  const body = req.body.body;
  const local = (req.ip == "::1" || req.ip == "127.0.0.1");
  chat.sendChat(body, local);
  
  res.set('Content-Type', 'text/plain');
  res.send(`chat received: ${body}`);
});

app.get('/chat', function (req, res) {
  const messages = chat.getChats();
  
  res.set('Content-Type', 'Application/JSON');
  res.send(JSON.stringify(messages));
});

app.post('/act', async function (req, res) {
	const body = req.body.body;
	
	const state = await game.act(body);
	
	res.set('Content-Type', 'Application/JSON');
	res.send(JSON.stringify(state));
});

app.listen(port, () => console.log(`Redscale is listening on port ${port}!`));
