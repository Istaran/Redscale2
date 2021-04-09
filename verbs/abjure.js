const combatengine = require('../combatengine');
const gameengine = require('../gameengine');
const cache = require('../cache');

let act = async function (state, details) {
    let enemy = state.enemy;
    let cards = await cache.load('data/combat/abjure cards.json');
    let card = cards[details.card];
    console.log(`Abjure card: ${JSON.stringify(card)}`);

    gameengine.displayText(state, card.display, 100, enemy.tags, enemy.scrubbers);

    let enemyDef = await cache.load(`data/enemies/${enemy.name}.json`);
    let enemyCardId = enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];

    gameengine.displayText(state, enemyCard["aggress display"], 100, enemy.tags, enemy.scrubbers);

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
        let attackText = "";
        if (assistdeflect > i) {
            attackText += assist.allydeflecttext;
            combatengine.deflect(enemyCard.accuracy, dodge, leader.evasion);
        } else if (deflect > i) {
            attackText += enemyCard["aggress deflect display"] || "You deflected an attack!\n";            
            combatengine.deflect(enemyCard.accuracy, dodge, leader.evasion);
        } else {
            if (deflect + brokethrough > i) {
                attackText += enemyCard["aggress breakthrough display"] || "Their attack broke through your deflection! ";
            }
            let hitMulti = combatengine.attackRoll(enemyCard.accuracy, dodge, leader.evasion);
            if (hitMulti == 0)
                attackText += enemyCard["aggress dodge display"] || "You avoided an attack!\n";
            else {
                attackText += `${enemy.name} hit you. `;
                if (hitMulti > 1)
                attackText += `Critical hit! (Net damage x${hitMulti}) `;
                let typeMulti = combatengine.getTypeMulti(leader, enemyCard.damagetype); 
                console.log(`Multiplier ${typeMulti} against type ${enemyCard.damagetype}`);
                let damage = combatengine.damageRoll(enemyCard.damagedice, enemyCard.damagedie, enemyCard.damageplus, soak, typeMulti * hitMulti);
                if (damage <= 0) {
                    attackText += enemyCard["aggress soak display"] || "You shrugged it off!\n";
                } else {
                    if (pierced) attackText += enemyCard["aggress pierce display"] || "They pierced through your defenses! ";
                    state.parties[state.activeParty].leader.health -= damage;
                    attackText += `You received ${damage} ${enemyCard.damagetype} damage!\n`;
                }
            }
            if (enemyCard.attacksupportpawn && assist.name) {
                attackText += enemyCard.attacksupportpawn + " (but not really because I haven't implemented that yet.)\n";
            }
        }
        await combatengine.addAttackResults(state, true);
        gameengine.displayText(state, attackText, 100, enemy.tags, enemy.scrubbers);
    }

    leader.abjureHand[details.card] = undefined;
    if (leader.stamina < 0) {
        gameengine.displayText(state, 
            `You discard ${Math.min(combatengine.handSize(leader.aggressHand), -leader.stamina)} aggress cards and ${Math.min(combatengine.handSize(leader.abjureHand), -leader.stamina)} abjure cards due to low stamina!`, 
            100, enemy.tags, enemy.scrubbers);
        combatengine.discardCards(leader.aggressHand, -leader.stamina);
        combatengine.discardCards(leader.abjureHand, -leader.stamina);
        leader.stamina = 0;
    }

    let engineProgress = await combatengine.progress(state);
    console.log("State: " + JSON.stringify(state));
    gameengine.displayText(state, engineProgress, 100, enemy.tags, enemy.scrubbers);
}

module.exports = {
	act: act
};