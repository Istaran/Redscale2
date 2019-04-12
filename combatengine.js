var cache = require('./cache');
var gameengine = null;

let getControls = async function (state) {
    if (!gameengine) gameengine = require('./gameengine');
    let controls = [];
    // Add cards based on phase, etc

    let phase = state.enemy.phasequeue[0] || "assess";

    if (phase == 'acquire') {
        let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
        let enemyPrivateDef = (state.query.nsfw ? await cache.load(`data/private/enemies/${state.enemy.name}.json`) : null);
        if (enemyPrivateDef) {
            for (var acqCard in enemyPrivateDef.acquirecards) {
                if (await gameengine.conditionMet(state, enemyPrivateDef.acquirecards[acqCard].if)) {
                    let enabled = await gameengine.conditionMet(state, enemyPrivateDef.acquirecards[acqCard].enabled);
                    let acq = {
                        "type": "card",
                        "display": enemyPrivateDef.acquirecards[acqCard].display,
                        "verb": "acquire",
                        "details": { "card": acqCard },
                        "help": enemyPrivateDef.acquirecards[acqCard].help,
                        "enabled": enabled
                    }
                    controls.push([acq]);
                }
            }
        }
        for (var acqCard in enemyDef.acquirecards) {
            if (!enemyPrivateDef || !enemyPrivateDef[acqCard] || await gameengine.conditionMet(state, enemyDef.acquirecards[acqCard].if)) {
                let enabled = await gameengine.conditionMet(state, enemyDef.acquirecards[acqCard].enabled);
                let acq = {
                    "type": "card",
                    "display": enemyDef.acquirecards[acqCard].display,
                    "verb": "acquire",
                    "details": { "card": acqCard },
                    "help": enemyDef.acquirecards[acqCard].help,
                    "enabled": enabled
                }
                controls.push([acq]);
            }
        }
    } else if (phase == 'assess') {
        // TODO: add additional assess cards from enemy public/private defs. Maybe someday do some optional personal choices.
        let cards = await cache.load(`data/combat/assess cards.json`);
        for (var card in cards) {
            let ctrl = {
                "type": "card",
                "display": cards[card].cardlines,
                "verb": phase,
                "details": { "card": card },
                "help": cards[card].help,
                "enabled": true
            };
            controls.push([ctrl]);
        }
    } else {
        
        let cards = await cache.load(`data/combat/${phase} cards.json`);
        let leader = state.parties[state.activeParty].leader;
        let hand = leader[`${phase}Hand`];
        for (var card in hand) {
            if (hand[card]) { // Oddly, this still brings up undefined cards if save is cached.
                let ctrl = {
                    "type": "card",
                    "display": cards[card].cardlines,
                    "count": hand[card],
                    "verb": phase,
                    "details": { "card": card },
                    "help": cards[card].help,
                    "enabled": true
                };
                controls.push([ctrl]);
            }
        }
        if (controls.length == 0) {
            let card = "NoCard";
            let ctrl = {
                "type": "card",
                "display": cards[card].cardlines,
                "count": hand[card],
                "verb": phase,
                "details": { "card": card },
                "help": cards[card].help,
                "enabled": true
            };
            controls.push([ctrl]);
        }
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

let configureEnemy = async function (state, target, flavor) {
    let leader = state.parties[state.activeParty].leader;
    leader.aggressHand = Object.assign({}, leader.aggressDefaultHand);
    leader.abjureHand = Object.assign({}, leader.abjureDefaultHand);

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
};

let drawCards = function (hand, pool, count) {
    let shuffle = [];
    for (var card in pool) {
        let num = pool[card] - (hand[card] ? hand[card] : 0);
        for (var i = 0; i < num; i++) {
            shuffle.push(card);
        }
    }
    console.log(`Drawing ${count} from ${JSON.stringify(shuffle)}`);
    for (; count > 0 && shuffle.length > 0; count--) {
        let card = shuffle.splice(Math.floor(Math.random() * shuffle.length), 1)[0];
        console.log(card);
        if (hand[card])
            hand[card]++;
        else
            hand[card] = 1;
    }

};


let discardCards = function (hand, count) {
    let shuffle = [];
    for (var card in hand) {
        let num = (hand[card] ? hand[card] : 0);
        for (var i = 0; i < num; i++) {
            shuffle.push(card);
        }
    }
    console.log(`Discarding ${count} from ${JSON.stringify(shuffle)}`);
    for (; count > 0 && shuffle.length > 0; count--) {
        let card = shuffle.splice(Math.floor(Math.random() * shuffle.length), 1)[0];
        console.log(card);
        hand[card]--;
        if (hand[card] == 0)
            hand[card] = undefined;
    }

};

// Given (net) accuracy of attacker and evasion of defender, roll to hit, return damage multiplier (1 for standard hit, 0 for miss, >1 for crit)
let attackRoll = function (accuracy, evasion) {
    if (accuracy <= 0) return 0;
    let roll = Math.random();
    let hit = 0;
	console.log(`Rolling: Chance: ${accuracy} / ${evasion}, Roll: ${roll}`);
    while (accuracy > roll * evasion) {
        hit++;
        accuracy -= evasion;
    }
	console.log(`${hit} hit${hit == 1 ? "" : "s"}`);
    return hit;
};

// Given (net) dice count/faces and modifier, roll the dice and return damage.
let damageRoll = function (damageDice, damageDie, damagePlus) {
    let damage = 0;
    console.log(`Rolling ${damageDice}d${damageDie}+${damagePlus}`);
    for (var i = 0; i < damageDice; i++) {
        damage += Math.floor(Math.random() * damageDie) + 1;
        console.log(damage);
    }
    damage += damagePlus;
    console.log(damage);
    return damage > 0 ? damage : 0;
};

let clearCombat = async function (state) {
    // Not sure if anything else will prove necessary, but let's route it through this one place.
    state.enemy = undefined;
};

let progress = async function (state) {
    let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
    if (!enemyDef) return `Failed to load enemy type in mid combat: ${state.enemy.name}`;

    if (state.parties[0].leader.health <= 0) {
        await (require('./player').reloadArchive(state));
        return "You were defeated! (reloading last save)"; // TEMP: need to flesh this out sometime. 
    }
    if (state.parties[state.activeParty].leader.health <= 0) {
        await clearCombat(state);
        return "You lost, but it wasn't you so whatever."; // TODO: flesh out side-party death scenario.
    }
    if (state.enemy.health <= 0) {
        state.enemy.phasequeue = ["acquire"];
        return `${enemyDef.killText || "You slew the " + state.enemy.name + "!"}\n\nIt's time to acquire! Pick a card...`; 
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
    clearCombat: clearCombat,
    configureEnemy: configureEnemy,
    progress: progress,
    drawCards: drawCards,
    discardCards: discardCards
};