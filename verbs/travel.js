const loc = require('../location');
const player = require('../player');

let act = async function (state, details) {
    if (state.event || state.event2 || state.enemy) return; // Somehow you cheaty-clicked to travel

    let requirementsMet = await loc.checkRequirements(state, details);
    if (requirementsMet) {

        player.passiveRecoverAll(state); // Travelling gives time passage, allowing basic recovery.

        if (details.location !== undefined) state.location = details.location;
        if (details.x !== undefined) state.x = details.x;
        if (details.y !== undefined) state.y = details.y;
        if (details.z !== undefined) state.z = details.z;

        await loc.explore(state);
    }
};


module.exports = {
	act: act
};