var combatengine = require('../combatengine');
var gameengine = require('../gameengine');
var cache = require('../cache');

let act = async function (state, details) {
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyPrivateDef = (state.query.nsfw ? await cache.load(`private/enemies/${state.enemy.name}.json`) : null);
    let apprehendCard = (enemyPrivateDef && enemyPrivateDef.apprehendcards && enemyPrivateDef.apprehendcards[details.card]) ? enemyPrivateDef.apprehendcards[details.card] : enemyDef.apprehendcards && enemyDef.apprehendcards[details.card];
    if (!apprehendCard) {
        let playercards = await cache.load('data/combat/apprehend cards.json');
        apprehendCard = playercards[details.card];
    }

    if (apprehendCard) { // Switching modes my end in a no-op maybe? Actually, status call should prevent.
        await gameengine.doVerb(apprehendCard.verb, state, apprehendCard.details);
    }
}

module.exports = {
    act: act
};