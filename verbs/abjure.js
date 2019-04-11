var combatengine = require('../combatengine');
var cache = require('../cache');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/abjure cards.json');
    let card = cards[details.card];
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyCardId = state.enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];
    let engineResult = "";

    let leader = state.parties[state.activeParty].leader;

    let deflect = Math.floor(card.deflect + (card.scaledeflect ? card.scaledeflect * (leader.abjureHand[details.card] - 1): 0) + Math.random());
    let dodge = card.dodge + (card.scaledodge ? card.scaledodge * (leader.abjureHand[details.card] - 1): 0);
    let soak = card.soak + (card.scalesoak ? card.scalesoak * (leader.abjureHand[details.card] - 1): 0);

    let attacks = Math.floor(enemyCard.attacks + Math.random());

    for (var i = 0; i < attacks; i++) {
        if (deflect > i)
            engineResult += enemyCard["aggress deflect display"] || "You deflected an attack!\n";
        else {
            let hitMulti = combatengine.attackRoll(enemyCard.accuracy - dodge, 10); // TEMP: hardcoded evasion at 10
            if (hitMulti == 0)
                engineResult += enemyCard["aggress dodge display"] || "You avoided an attack!\n";
            else {
                engineResult += `${state.enemy.name} hit you. `;
                if (hitMulti > 1)
                    engineResult += `Critical hit! (Net damage x${hitMulti}) `;
                let damage = combatengine.damageRoll(enemyCard.damagedice, enemyCard.damagedie, enemyCard.damageplus - soak) * hitMulti;
                if (damage <= 0) {
                    engineResult += enemyCard["aggress soak display"] || "You shrugged it off!\n";
                } else {
                    state.parties[state.activeParty].leader.health -= damage;
                    engineResult += `You received ${damage} damage!\n`;
                }
            }
        }
    }

    leader.abjureHand[details.card] = undefined;

    let engineProgress = await combatengine.progress(state);
    console.log("State: " + JSON.stringify(state));
    state.view.status = `${card.display}\n${enemyCard["aggress display"]}\n\n${engineResult}\n\n${engineProgress}`;
}


module.exports = {
	act: act
};