var combatengine = require('../combatengine');
var gameengine = require('../gameengine');
var cache = require('../cache');
var loc = require('../location');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/assess cards.json');
    let card = cards[details.card];
    let engineResult = "";
    state.enemy.phasequeue = ["assess"].concat(card.queue);

    if (card.escaperolls) {
        var navigator = (await loc.getControls(state))[0][0];
        var directions = ["up", "north", "west", "east", "south", "down", "nw", "ne", "sw", "se"]; // special is not allowed for fleeing.
        var escaperolls = card.escaperolls; // TODO: 
        for (var i = 0; i < escaperolls; i++) {
            let roll = Math.floor(Math.random() * directions.length);
            if (navigator.sub[directions[roll]]) {
                await combatengine.clearCombat(state);
                await gameengine.doVerb("travel", state, navigator.details[directions[roll]]);
                state.view.status = `${card.display}\nYou manage to get away!\n\n${state.view.status}`;
                return;
            }
        }

        engineResult = "But you can't get away!";
    }

    let leader = state.parties[state.activeParty].leader;
    if (card.abjuredraw)
        combatengine.drawCards(leader.abjureHand, leader.abjureCards, card.abjuredraw);
    if (card.aggressdraw)
        combatengine.drawCards(leader.aggressHand, leader.aggressCards, card.aggressdraw);
    if (card.recoverHealth) {
        let deltaHealth = Math.min(leader.maxHealth - leader.health, card.useMagic ? leader.mana : leader.stamina, leader.healthRecover * card.recoverHealth);
        leader.health += deltaHealth;
        if (card.useMagic) leader.mana -= deltaHealth;
        else leader.stamina -= deltaHealth;
    }

    let engineProgress = await combatengine.progress(state);
    state.view.status = `${card.display}\n\n${engineResult}\n\n${engineProgress}`;
}


module.exports = {
    act: act
};