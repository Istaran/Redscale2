var cache = require('../cache');

let act = async function (state, details) {
    state.view.status = "You restore the previous moment of time.";
    let timestamp = Date.now();
    cache.save(`saves/archive/${timestamp}.json`, state);
    state.archive = timestamp;
    state.view.status = "You rest peacefully, backing up your save, but other effects of resting aren't implemented yet.";
};


module.exports = {
	act: act
};