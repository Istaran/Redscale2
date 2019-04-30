// Future note: GameEngine reference will be needed eventually. it needs to lazy load like location.js does, because of circular dependency.
let cache = require('./cache');
let loc = require('./location');
let gameengine = null;

let addControls = async function (state, controls) {
    if (!gameengine) gameengine = require('./gameengine');
    let spot = state.world.locations[state.location] &&
        state.world.locations[state.location][state.z] &&
        state.world.locations[state.location][state.z][state.y] &&
        state.world.locations[state.location][state.z][state.y][state.x];
    if (spot) {
        let thirdColumn = [];
        if (spot.building) {
            let manageButton = 
                await gameengine.getControl(state, {
                    "type": "actButton",
                    "display": "Manage " + spot.building.display,
                    "verb": "flavor",
                    "details": {
                        "text": `You try to manage ${spot.building.display}, but you can't get the darn UI to come up. Damnit, Istaran.`
                    },
                    "help": "Leave some of your pawns or followers here to get stuff done, or bring some along with you on your adventure."
                });
            thirdColumn.push(manageButton);
            let inventoryButton = await gameengine.getControl(state, {
                    "type": "actButton",
                    "display": "Manage inventory",
                    "verb": "setscene",
                    "details": {
                        "text": "",
                        "type": "requantify",
                        "name": "inventory",
                        "sub": "start" 
                    },
                    "help": "Leave some of your possessions here, or pick some back up to carry with you."
            });
            thirdColumn.push(inventoryButton);
        }
        if (thirdColumn.length)
            controls[2] = thirdColumn;
    }
}

let getStatusDisplay = function (state) {
    if (state.parties.length == 0) return { lines: [] };

    let leader = state.parties[state.activeParty].leader;
    let healthText = `Health: ${leader.health} / ${leader.maxHealth}`;
    let staminaText = `Stamina: ${leader.stamina} / ${leader.maxStamina}`;
    let nutritionText = `Nutrition: ${leader.nutrition} / ${leader.maxNutrition}`;
    let manaText = `Mana: ${leader.mana} / ${leader.maxMana}`;
	let statusDisplay = {
        lines: [
            { "text": leader.display },
            { "text": healthText, "help": "Health.\nWhen your health drops to zero, you will be force to rewind to your last rest point. Over time, nutrition converts to stamina and then to health." },
            { "text": staminaText, "help":"Stamina.\nWhen your stamina drops to zero, you will need to digest food to recover. Some actions spend stamina, and also it converts to health over time."},
            { "text": nutritionText, "help": "Nutrition.\nEat food to fill up so you can recover and heal." },
            { "text": manaText, "help": "Mana.\nThe mystical energy that wells up within you over time." }
        ]
	};
	
	return statusDisplay;
}

let setDefaults = async function (state) {
    // Backfill default values not already in the save. Difference between this and migrations is migrations are to change existing data that has been transformed or rebalanced.
    if (!state.world) {
        state.world = {
            locations: {}
        }
    }
    if (!state.world.locations['Dragonbone Cave']) {
        state.world.locations['Dragonbone Cave'] = {};
    }
    if (!state.world.locations['Dragonbone Cave'][0]) {
        state.world.locations['Dragonbone Cave'][0] = {};
    }
    if (!state.world.locations['Dragonbone Cave'][0][5]) {
        state.world.locations['Dragonbone Cave'][0][5] = {};
    }
    if (!state.world.locations['Dragonbone Cave'][0][5][4]) {
        state.world.locations['Dragonbone Cave'][0][5][4] = {
            building: {
                display: "your hoard",
                type: "hoard",
                subtype: null,
                inventory: {},
                crew: {},
                lastUpdated: 0
            }
        };
    }
    if (state.parties[0]) {
        if (!state.parties[0].leader.maxpawnassist)
            state.parties[0].leader.maxpawnassist = 4;
        if (!state.parties[0].leader.tags) {
            let leaderDef = await cache.load(`data/characters/${state.parties[0].leader.name}.json`);
            state.parties[0].leader.tags = Object.assign({}, leaderDef.tags);
        }
        if (Array.isArray(state.parties[0].inventory))
            state.parties[0].inventory = {};
    }
}

let passiveRecoverAll = function (state) {
    state.parties.forEach((party) => {
        passiveRecover(party.leader);
        // TODO recover the rest of the party
    });
    state.gameTime++;
};

let passiveRecover = function (character) {
    let deltaHealth = Math.min(character.maxHealth - character.health, character.stamina + Math.min(character.staminaRecover, character.nutrition), character.healthRecover);
    character.health += deltaHealth;
    character.stamina -= deltaHealth;

    let deltaStamina = Math.min(character.maxStamina - character.stamina, character.nutrition, character.staminaRecover);
    character.stamina += deltaStamina;
    character.nutrition -= deltaStamina;

    character.mana = Math.min(character.maxMana, character.mana + character.manaRecover);
};


let reloadArchive = async function (state) {
    let oldPath = state.archive ? `saves/archive/${state.archive}.json` : './data/newGame.json';
    let oldState = await cache.load(oldPath);
    if (!oldState && state.archive)
        oldState = await cache.load('./data/newGame.json');
    await setDefaults(oldState);
    // TODO: run any pending migrations.

    let archive = state.archive;

    for (var prop in state) { if (state.hasOwnProperty(prop)) { delete state[prop]; } }
    Object.assign(state, oldState);
    state.archive = archive; // preserve linking. TODO: support jumping back multiple steps.
}

let getSavePreview = async function (state) {
    let leader = state.parties[state.activeParty] && state.parties[state.activeParty].leader;
    let locTitle = await loc.getTitle(state);
    let time = require('./time');
    var prev = "";
    if (leader) {
        prev = `${leader.display}\n${time.getTimeString(state)}\nAt ${locTitle}\nH:${leader.health}/${leader.maxHealth} S:${leader.stamina}/${leader.maxStamina} M:${leader.mana}/${leader.maxMana}`;
        if (state.enemy) {
            let enemyDef = await cache.load(`data/enemies/${state.enemy.name}.json`);
            prev += `\nFighting ${enemyDef.display}`;
        }
    } else {
        prev = "Resume character creation...";
    }
    return prev;
}

module.exports = {
	addControls: addControls,
    getStatusDisplay: getStatusDisplay,
    setDefaults: setDefaults,
    getSavePreview: getSavePreview,
    reloadArchive: reloadArchive,
    passiveRecoverAll: passiveRecoverAll
};