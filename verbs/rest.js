const gameengine = require('../gameengine');
const player = require('../player');
const whilesPerRest = 10;

let act = async function (state, details) {
    for (var i = 0; i < whilesPerRest; i++) {
        player.passiveRecoverAll(state);
        // TODO: apply other passages of time, with a flag in place to be clear you are asleep.
    }

    await gameengine.archive(state);

    if (!details.silent) {
        gameengine.displayText(state, details.text, details.pause || 100);
    }
};


module.exports = {
	act: act
};