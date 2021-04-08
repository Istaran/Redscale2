var combatengine = require('../combatengine');
var gameengine = require('../gameengine');
var cache = require('../cache');
var loc = require('../location');

let act = async function (state, details) {
    let cards = await cache.load('data/combat/assess cards.json');
    let card = cards[details.card];    
    let enemy = state.enemy;
    enemy.phasequeue = ["assess"].concat(card.queue);

    gameengine.displayText(state, card.display, 100, enemy.tags, enemy.scrubbers);

    if (card.escaperolls) {
        var navigator = (await loc.getControls(state))[0][0];
        var directions = ["up", "north", "west", "east", "south", "down", "nw", "ne", "sw", "se"]; // special is not allowed for fleeing.
        var escaperolls = card.escaperolls; // TODO: 
        for (var i = 0; i < escaperolls; i++) {
            let roll = Math.floor(Math.random() * directions.length);
            if (navigator.sub[directions[roll]]) {
                await combatengine.clearCombat(state);
                gameengine.displayText(state, `${card.display}\nYou manage to get away!\n\n`);
                await gameengine.doVerb("travel", state, navigator.details[directions[roll]]);
                return;
            }
        }
        gameengine.displayText(state, "But you can't get away!", 100, enemy.tags, enemy.scrubbers);
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
    gameengine.displayText(state, engineProgress, 100, enemy.tags, enemy.scrubbers);
}

module.exports = {
    act: act
};