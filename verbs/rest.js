var cache = require('../cache');
var player = require('../player');

let act = async function (state, details) {
    player.passiveRecoverAll(state);
    player.passiveRecoverAll(state);
    player.passiveRecoverAll(state);
    player.passiveRecoverAll(state);
    player.passiveRecoverAll(state);
    player.passiveRecoverAll(state);

    state.view.status = "You restore the previous moment of time.";
    let timestamp = Date.now();
    cache.save(`saves/archive/${timestamp}.json`, state);
    state.archive = timestamp;
    state.view.status = (details.silent ? "" : "You rest peacefully, digesting your food, recovering your strength, and backing up your save.");
};


module.exports = {
	act: act
};