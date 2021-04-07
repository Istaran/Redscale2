const gameengine = require('../gameengine');

let act = async function(state, details) {    
    gameengine.displayText(state, details.text, details.pause || 100);
};

module.exports = {
	act: act
};