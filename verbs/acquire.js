var combatengine = require('../combatengine');
var gameengine = require('../gameengine');
var cache = require('../cache');

let act = async function (state, details) {
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let acquireCard = enemyDef.acquirecards[details.card];
    await combatengine.clearCombat(state);
    await gameengine.doVerb(acquireCard.verb, state, acquireCard.details);
}


module.exports = {
	act: act
};