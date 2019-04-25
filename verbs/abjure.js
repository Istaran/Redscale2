var combatengine = require('../combatengine');
var cache = require('../cache');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/abjure cards.json');
    let card = cards[details.card];
    console.log(`Abjure card: ${JSON.stringify(card)}`);

    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyCardId = state.enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];
    let engineResult = "";

    let leader = state.parties[state.activeParty].leader;
    let assist = leader.activeassist || {};

    let assistdeflect = Math.floor(assist.allydeflect + Math.random());
    let deflect = assistdeflect + Math.floor(card.deflect + (leader.bonusdeflect || 0) + (card.scaledeflect ? card.scaledeflect * (leader.abjureHand[details.card] - 1) : 0) + Math.random());
    let dodge = card.dodge + (leader.bonusdodge || 0) + (card.scaledodge ? card.scaledodge * (leader.abjureHand[details.card] - 1): 0);
    let soak = card.soak + (leader.bonussoak || 0) + (card.scalesoak ? card.scalesoak * (leader.abjureHand[details.card] - 1): 0);
    let staminacost = card.staminacost + (card.scalestaminacost ? card.scalestaminacost * (leader.abjureHand[details.card] - 1) : 0);
    leader.stamina -= staminacost;

    let attacks = Math.floor(enemyCard.attacks + Math.random());

    for (var i = 0; i < attacks; i++) {
        if (assistdeflect > i) {
            engineResult += assist.allydeflecttext;
        } else if (deflect > i) {
            engineResult += enemyCard["aggress deflect display"] || "You deflected an attack!\n";
        } else {
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
                    engineResult += `You received ${damage} ${enemyCard.damagetype} damage!\n`;
                }
            }
        }
    }

    leader.abjureHand[details.card] = undefined;
    if (leader.stamina < 0) {
        engineResult += `\nYou discard ${Math.min(combatengine.handSize(leader.aggressHand), -leader.stamina)} aggress cards and ${Math.min(combatengine.handSize(leader.abjureHand), -leader.stamina)} abjure cards due to low stamina!\n`
        combatengine.discardCards(leader.aggressHand, -leader.stamina);
        combatengine.discardCards(leader.abjureHand, -leader.stamina);
        leader.stamina = 0;
    }

    let engineProgress = await combatengine.progress(state);
    console.log("State: " + JSON.stringify(state));
    state.view.status = `${card.display}\n${enemyCard["aggress display"]}\n\n${engineResult}\n${engineProgress}`;
}


module.exports = {
	act: act
};