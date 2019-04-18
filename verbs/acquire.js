var combatengine = require('../combatengine');
var gameengine = require('../gameengine');
var cache = require('../cache');

let act = async function (state, details) {
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyPrivateDef = (state.query.nsfw ? await cache.load(`private/enemies/${state.enemy.name}.json`) : null);
    let acquireCard = (enemyPrivateDef && enemyPrivateDef.acquirecards && enemyPrivateDef.acquirecards[details.card]) ? enemyPrivateDef.acquirecards[details.card] : enemyDef.acquirecards[details.card];
    await combatengine.clearCombat(state);
    if (acquireCard) { // Switching modes my end in a no-op maybe? Actually, status call should prevent.
        await gameengine.doVerb(acquireCard.verb, state, acquireCard.details);
    }
}


module.exports = {
	act: act
};