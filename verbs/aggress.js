var combatengine = require('../combatengine');
var cache = require('../cache');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/aggress cards.json');
    let card = cards[details.card];
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyCardId = state.enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];
    let engineResult = "";
    for (var i = 0; i < card.attacks; i++) {
        // TODO: handle fractional attacks/deflects(?)
        if (enemyCard.deflect > i)
            engineResult += state.enemy.name + " deflected your attack!\n";
        else {
            let hitMulti = combatengine.attackRoll(card.accuracy - enemyCard.dodge, enemyDef.evasion);
            if (hitMulti == 0)
                engineResult += state.enemy.name + " avoided your attack!\n";
            else {
                engineResult += `You hit ${state.enemy.name}. `;
                if (hitMulti > 1)
                    engineResult += `Critical hit! (Net damage x${hitMulti}) `;
                let damage = combatengine.damageRoll(card.damagedice, card.damagedie, card.damageplus - enemyCard.soak) * hitMulti;
                if (damage <= 0) {
                    engineResult += "They shrugged it off!\n";
                } else {
                    state.enemy.health -= damage;
                    engineResult += `You dealt ${damage} damage!\n`;
                }
            }
        }
    }

    let engineProgress = await combatengine.progress(state);
    state.view.status = `${card.display}\n${enemyCard["abjure display"]}\n\n${engineResult}\n${engineProgress}`;
}


module.exports = {
    act: act
};