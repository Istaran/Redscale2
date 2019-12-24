var loc = require('../location');
let player = require('../player');

let act = async function (state, details) {
    player.passiveRecoverAll(state); // Travelling gives time passage, allowing basic recovery.
    
    state.view.status = details.text;
};


module.exports = {
	act: act
};