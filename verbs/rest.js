var gameengine = require('../gameengine');
var player = require('../player');
const whilesPerRest = 10;

let act = async function (state, details) {
    for (var i = 0; i < whilesPerRest; i++) {
        player.passiveRecoverAll(state);
        // TODO: apply other passages of time, with a flag in place to be clear you are asleep.
    }

    await gameengine.archive(state);

    state.view.status = (details.silent ? "" : "You rest peacefully, digesting your food, recovering your strength, and backing up your save.");
};


module.exports = {
	act: act
};