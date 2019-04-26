let cache = require('../cache');
let combatengine = require('../combatengine');

let act = async function (state, details) {
    state.view.status = details.text;

    let tags = {};
    if (details.tags == "enemy") {
        tags = Object.assign(tags, state.enemy.tags);
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
};


module.exports = {
	act: act
};