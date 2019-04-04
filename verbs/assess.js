var combatengine = require('../combatengine');
var cache = require('../cache');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/assess cards.json');
    let card = cards[details.card];
    let engineResult = `TEMP: you assess!`;
    state.enemy.phasequeue = ["assess"].concat(card.queue);
    let engineProgress = await combatengine.progress(state);
    state.view.status = `${card.display}\n\n${engineResult}\n\n${engineProgress}`;
}


module.exports = {
    act: act
};