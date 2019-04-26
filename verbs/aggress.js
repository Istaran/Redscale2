var combatengine = require('../combatengine');
var cache = require('../cache');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/aggress cards.json');
    let card = cards[details.card];
    console.log(`Aggress card: ${JSON.stringify(card)}`);

    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    let enemyCardId = state.enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];
    let engineResult = "";

    let leader = state.parties[state.activeParty].leader;
    let assist = leader.activeassist || {};

    let attacks = Math.floor(card.attacks + (leader.bonusattacks || 0) + (card.scaleattacks ? card.scaleattacks * (leader.aggressHand[details.card] - 1) : 0) + Math.random());
    let accuracy = card.accuracy + (leader.bonusaccuracy || 0) + (assist.bonusaccuracy || 0) + (card.scaleaccuracy ? card.scaleaccuracy * (leader.aggressHand[details.card] - 1) : 0);
    let damagedice = card.damagedice + (card.scaledamagedice ? card.scaledamagedice * (leader.aggressHand[details.card] - 1) : 0);
    let damagedie = card.damagedie + (card.scaledamagedie ? card.scaledamagedie * (leader.aggressHand[details.card] - 1) : 0);
    let damageplus = card.damageplus + (leader.bonusdamage || 0) + (assist.bonusdamage || 0) + (card.scaledamageplus ? card.scaledamageplus * (leader.aggressHand[details.card] - 1) : 0);
    let staminacost = (card.staminacost || 0) + (card.scalestaminacost ? card.scalestaminacost * (leader.aggressHand[details.card] - 1) : 0);
    leader.stamina -= staminacost;

    let deflect = Math.floor(enemyCard.deflect + Math.random());

    //  TODO: add in assist bonus-attacks first.

    for (var i = 0; i < attacks; i++) {
        if (deflect > i)
            engineResult += card["aggress deflect display"] || (`The ${enemyDef.display} deflected your attack!\n`);
        else {
            let hitMulti = combatengine.attackRoll(accuracy - enemyCard.dodge, enemyDef.evasion);
            if (hitMulti == 0)
                engineResult += card["aggress dodge display"] || (`The ${enemyDef.display} avoided your attack!\n`);
            else {
                engineResult += `You hit ${state.enemy.name}. `;
                if (hitMulti > 1)
                    engineResult += `Critical hit! (Net damage x${hitMulti}) `;
                let damage = combatengine.damageRoll(damagedice, damagedie, damageplus - enemyCard.soak) * hitMulti;
                if (damage <= 0) {
                    engineResult += card["aggress soak display"] || "They shrugged it off!\n";
                } else {
                    state.enemy.health -= damage;
                    engineResult += `You dealt ${damage} ${card.damagetype} damage!\n`;
                }
            }
        }
    }

    leader.aggressHand[details.card] = undefined;
    if (leader.stamina < 0) {
        engineResult += `\nYou discard ${Math.min(combatengine.handSize(leader.aggressHand), -leader.stamina)} aggress cards and ${Math.min(combatengine.handSize(leader.abjureHand), -leader.stamina)} abjure cards due to low stamina!\n`
        combatengine.discardCards(leader.aggressHand, -leader.stamina);
        combatengine.discardCards(leader.abjureHand, -leader.stamina);
        leader.stamina = 0;
    }

    let engineProgress = await combatengine.progress(state);
    state.view.status = `${card.display}\n${enemyCard["abjure display"]}\n\n${engineResult}\n${engineProgress}`;
}


module.exports = {
    act: act
};