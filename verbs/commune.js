var loc = require('../location');

let act = async function(state, details) {
    state.view.status = "You commune with " + details.spirit + "! (But nothing really happens because communing isn't implemented yet)";
};


module.exports = {
	act: act
};