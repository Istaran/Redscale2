var combatengine = require('../combatengine');
var cache = require('../cache');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/abjure cards.json');
    let card = cards[details.card];
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyCardId = state.enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];
    let engineResult = "";
    for (var i = 0; i < enemyCard.attacks; i++) {
        // TODO: handle fractional attacks/deflects(?)
        if (card.deflect > i)
            engineResult += "You deflected an attack!\n";
        else {
            let hitMulti = combatengine.attackRoll(enemyCard.accuracy - card.dodge, 10); // TEMP: hardcoded evasion at 10
            if (hitMulti == 0)
                engineResult += "You avoided an attack!\n";
            else {
                engineResult += `${state.enemy.name} hit you. `;
                if (hitMulti > 1)
                    engineResult += `Critical hit! (Net damage x${hitMulti}) `;
                let damage = combatengine.damageRoll(enemyCard.damagedice, enemyCard.damagedie, enemyCard.damageplus - card.soak) * hitMulti;
                if (damage <= 0) {
                    engineResult += "They shrugged it off!\n";
                } else {
                    console.log(`You took ${damage} damage, except player health is not implemented.`);
                    engineResult += `You received ${damage} damage!\n`;
                }
            }
        }
    }
    let engineProgress = await combatengine.progress(state);
    state.view.status = `${card.display}\n${enemyCard["aggress display"]}\n\n${engineResult}\n\n${engineProgress}`;
}


module.exports = {
	act: act
};