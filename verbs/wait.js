const loc = require('../location');
const player = require('../player');
const gameengine = require('../gameengine');

let act = async function (state, details) {
    player.passiveRecoverAll(state); // Waiting gives time passage, allowing basic recovery.
    
    gameengine.displayText(state, details.text, details.pause || 100);
};


module.exports = {
	act: act
};