var combatengine = require('../combatengine');
var gameengine = require('../gameengine');
var cache = require('../cache');

let act = async function (state, details) {
    let enemy = state.enemy;
    let cards = await cache.load('data/combat/aggress cards.json');
    let card = cards[details.card];
    console.log(`Aggress card: ${JSON.stringify(card)}`);
    gameengine.displayText(state, card.display, 100, enemy.tags, enemy.scrubbers);

    let enemyDef = await cache.load(`data/enemies/${enemy.name}.json`);
    let enemyCardId = enemy.cardqueue[0];
    let enemyCard = enemyDef.cardsets[enemyCardId.set].cards[enemyCardId.card];
    gameengine.displayText(state, enemyCard["abjure display"], 100, enemy.tags, enemy.scrubbers);


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


    if (assist.allyattacks) {
        for (var i = 0; i < assist.allyattacks; i++) {
            let allyResult = "";
            if (deflect) {
                deflect--;
                allyResult += `The ${enemyDef.display} deflected your ally's attack!\n`;
                combatengine.deflect(assist.allyaccuracy, enemyCard.dodge, enemyDef.evasion);
            } else {
                let hitMulti = combatengine.attackRoll(assist.allyaccuracy, enemyCard.dodge, enemyDef.evasion);
                if (hitMulti == 0)
                    allyResult += assist.allymisstext + "\n";
                else {
                    allyResult += assist.allyhittext + " ";
                    if (hitMulti > 1)
                        allyResult += `Critical hit! (Net damage x${hitMulti}) `;
                    let damage = combatengine.damageRoll(assist.allydamagedice, assist.allydamagedie, assist.allydamageplus - Math.max(0, enemyCard.soak - (assist.allydamagepierce || 0))) * hitMulti;
                    if (damage <= 0) {
                        allyResult += card["aggress soak display"] || "{They} shrugged it off!\n";
                    } else {
                        enemy.health -= damage;
                        allyResult += `{They} dealt ${damage} ${card.damagetype} damage!\n`;
                    }
                }
            }
            combatengine.addAttackResults(state, false);
            gameengine.displayText(state, allyResult, 100, assist.tags, assist.scrubbers);
        }        
    }

    for (var i = 0; i < attacks; i++) {
        let attackText = "";
        if (deflect > i) {
            attackText += card["aggress deflect display"] || (`The ${enemyDef.display} deflected your attack!\n`);            
            combatengine.deflect(accuracy, enemyCard.dodge, enemyDef.evasion);
        }
        else {        
            let hitMulti = combatengine.attackRoll(accuracy, enemyCard.dodge, enemyDef.evasion);
            if (hitMulti == 0) {
                attackText += card["aggress dodge display"] || (`The ${enemyDef.display} avoided your attack!\n`);
            } else {
                attackText += `You hit ${enemy.name}. `;
                if (hitMulti > 1) {
                    attackText += `Critical hit! (Net damage x${hitMulti}) `;
                    if (enemyCard.noncritsoak > 0) {
                        attackText += "You bypassed {their} armor! ";
                    }
                }
                let typeMulti = (enemyDef.damageMultiplier && enemyDef.damageMultiplier[card.damagetype]) ? Math.floor(enemyDef.damageMultiplier[card.damagetype]) : 1;
                console.log(`Multiplier ${typeMulti} against type ${card.damagetype}`);
                let damage = combatengine.damageRoll(damagedice, damagedie, damageplus, enemyCard.soak + (hitMulti <= 1 && enemyCard.noncritsoak ? enemyCard.noncritsoak : 0), typeMulti * hitMulti);
                if (damage <= 0) {
                    attackText += card["aggress soak display"] || "{They} shrugged it off!\n";
                } else {
                    enemy.health -= damage;
                    attackText += `You dealt ${damage} ${card.damagetype} damage!\n`;
                    if (card.surrenderbonus)
                        enemy.surrenderbonus = card.surrenderbonus;

                    if (card.staminadamagedie) {
                        let staminadamage = combatengine.damageRoll(card.staminadamagedice, card.staminadamagedie, card.staminadamageplus, 1);
                        enemy.stamina -= staminadamage;
                        attackText += `You wear down your enemy, depleting ${staminadamage} stamina!\n`;
                    }
                }
            }
        }
        combatengine.addAttackResults(state, false);
        gameengine.displayText(state, attackText, 100, enemy.tags, enemy.scrubbers);
    }

    leader.aggressHand[details.card] = undefined;
    if (leader.stamina < 0) {
        gameengine.displayText(state, 
            `You discard ${Math.min(combatengine.handSize(leader.aggressHand), -leader.stamina)} aggress cards and ${Math.min(combatengine.handSize(leader.abjureHand), -leader.stamina)} abjure cards due to low stamina!`, 
            100, enemy.tags, enemy.scrubbers);
        combatengine.discardCards(leader.aggressHand, -leader.stamina);
        combatengine.discardCards(leader.abjureHand, -leader.stamina);
        leader.stamina = 0;
    }

    let engineProgress = await combatengine.progress(state);
    gameengine.displayText(state, engineProgress, 100, enemy.tags, enemy.scrubbers);
}


module.exports = {
    act: act
};