const gameengine = require('../gameengine');
const cache = require('../cache');

let act = async function (state, details) {
    // TODO: Use Type to guide where characters come from. Right now we only have genesis, meaning new characters are added from source.

    let newParty = {
        "display": details.display,
        "leader":null,
        "followers": [],
        "pawns": [],
        "inventory": {}
    };

    newParty.leader = JSON.parse(JSON.stringify(await cache.load(`data/characters/${details.leader}.json`)));
    state.parties.push(newParty);
    gameengine.displayText(state, details.text, details.pause || 100);
};


module.exports = {
	act: act
};