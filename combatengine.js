var cache = require('./cache');
var gameengine = null;

let getControls = async function (state) {
    if (!gameengine) gameengine = require('./gameengine');
    let controls = [[]];
    // Add cards based on phase, etc

    let phase = state.enemy.phasequeue[0] || "assess";

    // TEMP: Just add all defined cards as basic buttons
    let cards = await cache.load(`data/combat/${phase} cards.json`);
    for (var card in cards) {
        let ctrl = {
            "type": "actButton",
            "display": card,
            "verb": phase,
            "details": { "card": card },
            "help": cards[card].help,
            "enabled": true
        };
        controls[0].push(ctrl);
    }

    return controls;		
}

let getQueueFromSets = function (sets, max) {

    let pool = [];
    let queue = [];
    for (var s = 0; s < sets.length; s++) {
        for (var c = 0; c < sets[s].cards.length; c++) {
            pool.push({ set: s, card: c });
        }
    }
    for (var i = 0; i < max; i++) {
        let r = Math.floor(Math.random() * pool.length);
        let card = pool.splice(r, 1);
        queue.push(card[0]);
    }
    return queue;
}

let configureEnemy = async function (state, target, flavor)
{
    let targetDef = await cache.load(`data/enemies/${target}.json`);
    if (!targetDef) return `Failed to load enemy type: ${target}`;

    let phasequeue = ["assess"]; // Assess results in refilling queue.
    switch (flavor) {
        case "attack":
            phasequeue = ["abjure", "aggress", "assess"];
            break;
        case "hunt":
            phasequeue = ["aggress", "abjure", "assess"];
            break;
    }
    let enemy = {
        name: target,
        health: targetDef["max health"],
        phasequeue: phasequeue
    };

    enemy.cardqueue = getQueueFromSets(targetDef.cardsets, targetDef.reshuffle);

    console.log(`Configured enemy: ${JSON.stringify(enemy)}`);

    state.enemy = enemy;

    let announce = targetDef[`${flavor} announce`];
    let tell = targetDef.cardsets[enemy.cardqueue[0].set].tell;

    return `${announce}\n\n${tell}`;
}

// Given (net) accuracy of attacker and evasion of defender, roll to hit, return damage multiplier (1 for standard hit, 0 for miss, >1 for crit)
let attackRoll = function (accuracy, evasion) {
    if (accuracy <= 0) return 0;
    let roll = Math.random();
    let hit = 0;
    while (accuracy > roll * evasion) {
        hit++;
        accuracy -= evasion;
    }
    return hit;
};

// Given (net) dice count/faces and modifier, roll the dice and return damage.
let damageRoll = function (damageDice, damageDie, damagePlus) {
    let damage = 0;
    for (var i = 0; i < damageDice; i++) {
        damage += Math.floor(Math.random() * damageDie) + 1;
    }
    damage += damagePlus;
    return damage > 0 ? damage : 0;
};

let progress = async function (state) {
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    if (!enemyDef) return `Failed to load enemy type in mid combat: ${state.enemy.name}`;

    if (state.parties[0].leader.health <= 0) {
        await (require('./player').reloadArchive(state));
        return "You were defeated! (reloading last save)"; // TEMP: need to flesh this out sometime. 
    }
    if (state.parties[state.activeParty].leader.health <= 0) {
        state.enemy = undefined;
        return "You lost, but it wasn't you so whatever."; // TODO: flesh out side-party death scenario.
    }
    if (state.enemy.health <= 0) {
        state.enemy = undefined;
        return "You win!"; // TEMP: need to transition to victory options/results.
    }
    state.enemy.phasequeue.shift();
    if (state.enemy.phasequeue.length < 1) return "Ran out of phases. This should never happen, as Assess should add phases or end combat.";
    let newPhase = state.enemy.phasequeue[0];
    switch (newPhase) {
        case "assess":
            //Set new next card.
            state.enemy.cardqueue.shift();
            if (state.enemy.cardqueue.length <= 0)
                state.enemy.cardqueue = getQueueFromSets(enemyDef.cardsets, enemyDef.reshuffle);
            break;
    }

    return `${enemyDef.cardsets[state.enemy.cardqueue[0].set].tell}\n\nIt's time to ${newPhase}! Pick a card...`;
};

module.exports = {
    attackRoll: attackRoll,
    damageRoll: damageRoll,
    getControls: getControls,
    configureEnemy: configureEnemy,
    progress: progress
};