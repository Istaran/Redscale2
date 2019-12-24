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

    let assistdeflect = Math.floor((assist.allydeflect || 0) + Math.random());
    let deflect = assistdeflect + Math.floor(card.deflect + (leader.bonusdeflect || 0) + (card.scaledeflect ? card.scaledeflect * (leader.abjureHand[details.card] - 1) : 0) + Math.random());
    let brokethrough = (enemyCard.breakthrough > 0 && deflect > 0) ? Math.min(deflect, enemyCard.breakthrough) : 0;
    deflect -= brokethrough;
    let dodge = card.dodge + (leader.bonusdodge || 0) + (assist.bonusdodge || 0) + (card.scaledodge ? card.scaledodge * (leader.abjureHand[details.card] - 1): 0);
    let soak = card.soak + (leader.bonussoak || 0) + (assist.bonussoak || 0) + (card.scalesoak ? card.scalesoak * (leader.abjureHand[details.card] - 1) : 0);
    let pierced = (soak > 0 && enemyCard.damagepierce > 0);
    if (pierced) soak = Math.max(0, soak - enemyCard.damagepierce);
    let staminacost = card.staminacost + (card.scalestaminacost ? card.scalestaminacost * (leader.abjureHand[details.card] - 1) : 0);
    leader.stamina -= staminacost;

    let attacks = Math.floor(enemyCard.attacks + Math.random());

    for (var i = 0; i < attacks; i++) {
        if (assistdeflect > i) {
            engineResult += assist.allydeflecttext;
        } else if (deflect > i) {
            engineResult += enemyCard["aggress deflect display"] || "You deflected an attack!\n";
        } else {
            if (deflect + brokethrough > i) {
                engineResult += enemyCard["aggress breakthrough display"] || "Their attack broke through your deflection! ";
            }
            let hitMulti = combatengine.attackRoll(enemyCard.accuracy - dodge, 10); // TEMP: hardcoded evasion at 10
            if (hitMulti == 0)
                engineResult += enemyCard["aggress dodge display"] || "You avoided an attack!\n";
            else {
                engineResult += `${state.enemy.name} hit you. `;
                if (hitMulti > 1)
                    engineResult += `Critical hit! (Net damage x${hitMulti}) `;
                let typeMulti = (leader.damageMultiplier && leader.damageMultiplier[enemyCard.damagetype]) ? Math.floor(leader.damageMultiplier[enemyCard.damagetype]) : 1;
                console.log(`Multiplier ${typeMulti} against type ${enemyCard.damagetype}`);
                let damage = combatengine.damageRoll(enemyCard.damagedice, enemyCard.damagedie, enemyCard.damageplus - soak, typeMulti * hitMulti);
                if (damage <= 0) {
                    engineResult += enemyCard["aggress soak display"] || "You shrugged it off!\n";
                } else {
                    if (pierced) engineResult += enemyCard["aggress pierce display"] || "They pierced through your defenses! ";
                    state.parties[state.activeParty].leader.health -= damage;
                    engineResult += `You received ${damage} ${enemyCard.damagetype} damage!\n`;
                }
            }
            if (enemyCard.attacksupportpawn && assist.name) {
                engineResult += enemyCard.attacksupportpawn + " (but not really because I haven't implemented that yet.)\n";
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