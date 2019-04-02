var loc = require('../location');

let act = async function(state, details) {
    state.view.status = "You are attacked by a " + details.enemy + "! (But nothing really happens because combat isn't implemented yet)";
};


module.exports = {
	act: act
};