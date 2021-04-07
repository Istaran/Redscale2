let loc = require('../location');

let act = async function (state, details) {
    // Clear old dirty text
    if (state.dirty && !state.query.nsfw) {
        state.view.display = [{ type: "text", text: await loc.getDescription(state)}]
    } else if (state.view.status) {
        // migrate old view style to new.
        state.view.display = [{ type: "text", text: state.view.status}];
    }
};


module.exports = {
	act: act
};