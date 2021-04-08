const cache = require('../cache');
const combatengine = require('../combatengine');
const gameengine = require('../gameengine');

let act = async function (state, details) {
    let tags = {};
    let scrubbers = null;
    if (details.tags == "enemy") {
        tags = Object.assign(tags, state.enemy.tags);
        scrubbers = state.enemy.scrubbers;
        combatengine.clearCombat(state);
    } else if (details.tags) {
        for (var i = 0; i < details.tags.length; i++) {
            if (Array.isArray(details.tags[i])) {
                let tag = details.tags[i][Math.floor(Math.random() * details.tags[i].length)];
                if (tag) tags[tag] = true;
            } else {
                tags[details.tags[i]] = true;
            }
        }
    }

    let pawnDef = await cache.load(`data/pawns/${details.name}.json`);
    let pawn = {
        name: details.name,
        health: pawnDef.maxHealth,
        tags: tags,
        display: pawnDef.display
    };
    state.parties[state.activeParty].pawns.push(pawn);

    gameengine.displayText(state, details.text, details.pause || 100, tags, scrubbers || pawnDef.scrubbers);
};


module.exports = {
	act: act
};