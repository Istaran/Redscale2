var cache = require('./cache');
var gameengine = null;

let getControls = async function (state) {
    if (!gameengine) gameengine = require('./gameengine');
    let controls = [];
    // Add cards based on phase, etc

    let phase = state.enemy.phasequeue[0] || "assess";

    if (phase == 'acquire' || phase == 'apprehend' || phase == 'assess') {
        // Add in order: private (NSWF) cards, normal cards, and player cards. Earlier in that list trumps later versions, even if the earlier version is hidden/disabled.

        let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
        let enemyPrivateDef = (state.query.nsfw ? await cache.load(`private/enemies/${state.enemy.name}.json`) : null);
        if (enemyPrivateDef) {
            for (var acqCard in enemyPrivateDef[`${phase}cards`]) {
                if (await gameengine.conditionMet(state, enemyPrivateDef[`${phase}cards`][acqCard].if)) {
                    let enabled = await gameengine.conditionMet(state, enemyPrivateDef[`${phase}cards`][acqCard].enabled);
                    let acq = {
                        "type": "card",
                        "display": enemyPrivateDef[`${phase}cards`][acqCard].display,
                        "verb": phase,
                        "details": { "card": acqCard },
                        "help": enemyPrivateDef[`${phase}cards`][acqCard].help,
                        "enabled": enabled
                    }
                    controls.push([acq]);
                }
            }
        }
        for (var acqCard in enemyDef[`${phase}cards`]) {
            if (!(enemyPrivateDef && enemyPrivateDef[`${phase}cards`] && enemyPrivateDef[`${phase}cards`][acqCard]) && await gameengine.conditionMet(state, enemyDef[`${phase}cards`][acqCard].if)) {
                let enabled = await gameengine.conditionMet(state, enemyDef[`${phase}cards`][acqCard].enabled);
                let acq = {
                    "type": "card",
                    "display": enemyDef[`${phase}cards`][acqCard].display,
                    "verb": phase,
                    "details": { "card": acqCard },
                    "help": enemyDef[`${phase}cards`][acqCard].help,
                    "enabled": enabled
                }
                controls.push([acq]);
            }
        }

        let playercards = await cache.load(`data/combat/${phase} cards.json`);
        for (var card in playercards) {
            if (!(enemyPrivateDef && enemyPrivateDef[`${phase}cards`] && enemyPrivateDef[`${phase}cards`][card]) && !(enemyDef && enemyDef[`${phase}cards`] && enemyDef[`${phase}cards`][card]) && await gameengine.conditionMet(state, playercards[card].if)) {
                let enabled = await gameengine.conditionMet(state, playercards[card].enabled);
                let ctrl = {
                    "type": "card",
                    "display": playercards[card].cardlines,
                    "verb": phase,
                    "details": { "card": card },
                    "help": playercards[card].help,
                    "enabled": enabled
                };
                controls.push([ctrl]);
            }
        }
    }
    if (phase == 'abjure' || phase == 'aggress') {
        
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
        stamina: targetDef["max stamina"],
        mana: targetDef["max mana"],
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

    if (state.enemy.phasequeue[1] == "assess") {
        state.enemy.stamina -= enemyDef.cardsets[state.enemy.cardqueue[0].set].cards[state.enemy.cardqueue[0].card].staminacost; // Pay stamina cost just before assess.
    }

    if (state.enemy.stamina <= 0) {
        state.enemy.phasequeue = ["apprehend"];
        return `${enemyDef.captureText || enemyDef.display + " collapsed from exhaustion, unable to fight back any longer!"}\n\nIt's time to apprehend! Pick a card...`; 
    }

    if (state.enemy.health <= enemyDef["yield max health"]) {
        let yieldChance = enemyDef["yield base chance"] + enemyDef["yield scale chance"] * (enemyDef["yield max health"] - state.enemy.health);
        if (Math.random() < yieldChance) {
            state.enemy.phasequeue = ["apprehend"];
            return `${enemyDef.surrenderText || enemyDef.display + " lost the will to fight, and surrendered unconditionally!"}\n\nIt's time to apprehend! Pick a card...`; 
        }
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


let getStatusDisplay = async function (state) {
    if (!state.enemy) return { lines: [] };

    let enemy = state.enemy;
    let enemyDef = await cache.load(`data/enemies/${enemy.name}.json`);

    let health = Math.floor(enemy.health / enemyDef["max health"] * 10);
    let stamina = Math.floor(enemy.stamina / enemyDef["max stamina"] * 10);
    let mana = Math.floor(enemy.mana / enemyDef["max mana"] * 10);

    let healthText = `Health: ${health}0%`;
    let staminaText = `Stamina: ${stamina}0%`;
    let manaText = `Mana: ${mana}0%`;
    let statusDisplay = {
        lines: [
            { "text": enemyDef.display },
            { "text": healthText, "help": "Health.\nWhen their health drops to zero, they will die and you can harvest your reward from their corpse." },
            { "text": staminaText, "help": "Stamina.\nWhen their stamina drops to zero, they will be forced to submit and you can choose between mercy and murder." },
            { "text": manaText, "help": "Mana.\nNot all creatures know how to use mana, but all of them possess at least some." }
        ]
    };

    return statusDisplay;
}

module.exports = {
    attackRoll: attackRoll,
    damageRoll: damageRoll,
    getControls: getControls,
    clearCombat: clearCombat,
    configureEnemy: configureEnemy,
    progress: progress,
    drawCards: drawCards,
    discardCards: discardCards,
    getStatusDisplay: getStatusDisplay
};