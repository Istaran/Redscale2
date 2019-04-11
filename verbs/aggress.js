var combatengine = require('../combatengine');
var cache = require('../cache');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/aggress cards.json');
    let card = cards[details.card];

    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyCardId = state.enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];
    let engineResult = "";

    let leader = state.parties[state.activeParty].leader;

    let attacks = Math.floor(card.attacks + (card.scaledattacks ? card.scaledattacks * (leader.aggressHand[details.card] - 1) : 0) + Math.random());
    let accuracy = card.accuracy + (card.scaleaccuracy ? card.scaleaccuracy * (leader.aggressHand[details.card] - 1) : 0);
    let damagedice = card.damagedice + (card.scaledamagedice ? card.scaledamagedice * (leader.aggressHand[details.card] - 1) : 0);
    let damagedie = card.damagedie + (card.damagedie ? card.damagedie * (leader.aggressHand[details.card] - 1) : 0);
    let damageplus = card.damageplus + (card.damageplus ? card.damageplus * (leader.aggressHand[details.card] - 1) : 0);

    let deflect = Math.floor(enemyCard.deflect + Math.random());

    for (var i = 0; i < attacks; i++) {
        if (deflect > i)
            engineResult += enemyCard["abjure deflect display"] || (state.enemy.name + " deflected your attack!\n");
        else {
            let hitMulti = combatengine.attackRoll(accuracy - enemyCard.dodge, enemyDef.evasion);
            if (hitMulti == 0)
                engineResult += enemyCard["abjure dodge display"] || (state.enemy.name + " avoided your attack!\n");
            else {
                engineResult += `You hit ${state.enemy.name}. `;
                if (hitMulti > 1)
                    engineResult += `Critical hit! (Net damage x${hitMulti}) `;
                let damage = combatengine.damageRoll(damagedice, damagedie, damageplus - enemyCard.soak) * hitMulti;
                if (damage <= 0) {
                    engineResult += enemyCard["abjure soak display"] || "They shrugged it off!\n";
                } else {
                    state.enemy.health -= damage;
                    engineResult += `You dealt ${damage} damage!\n`;
                }
            }
        }
    }

    leader.aggressHand[details.card] = undefined;

    let engineProgress = await combatengine.progress(state);
    state.view.status = `${card.display}\n${enemyCard["abjure display"]}\n\n${engineResult}\n${engineProgress}`;
}


module.exports = {
    act: act
};