var loc = require('../location');

let act = async function(state, details) {
    state.view.status = "You try to hunt some " + details.targets[0].name + " or maybe " + details.targets[1].name + " but you couldn't find any because hunting isn't implemented yet.";
};


module.exports = {
	act: act
};