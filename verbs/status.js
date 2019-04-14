let loc = require('../location');

let act = async function (state, details) {
    // Clear old dirty text
    if (state.dirty && !state.query.nsfw) {
        state.view.status = await loc.getDescription(state);
    }
};


module.exports = {
	act: act
};