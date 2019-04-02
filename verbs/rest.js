var loc = require('../location');

let act = async function(state, details) {
    state.view.status = "You rest peacefully, but it has no effect because resting isn't implemented yet.";
};


module.exports = {
	act: act
};