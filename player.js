// Future note: GameEngine reference will be needed eventually. it needs to lazy load like location.js does, because of circular dependency.
let cache = require('./cache');
let loc = require('./location');
let gameengine = null;

let addControls = async function (state, controls) {
    if (!gameengine) gameengine = require('./gameengine');
    let party = state.parties && state.parties[state.activeParty];
    let spot = state.world.locations[state.location] &&
        state.world.locations[state.location][state.z] &&
        state.world.locations[state.location][state.z][state.y] &&
        state.world.locations[state.location][state.z][state.y][state.x];

    let thirdColumn = [];
    let fourthColumn = [];
    if (spot && spot.building) {
        let manageButton =
            await gameengine.getControl(state, {
                "type": "actButton",
                "display": "Manage " + spot.building.display,
                "verb": "setscene",
                "details": {
                    "text": "",
                    "type": "reassign",
                    "name": "building",
                    "sub": "start"
                },
                "help": "Leave some of your pawns here to get stuff done, or bring some along with you on your adventure."
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
    } else {
        await loc.getBuildOptions(state);
        if (state.buildoptions && party.pawns.length > 0) {
            let buildButton = await gameengine.getControl(state, {
                "type": "actButton",
                "display": "Create encampment",
                "verb": "setscene",
                "details": {
                    "text": "You consider what sort of encampment you should set up here.",
                    "name": "building",
                    "sub": "construction"
                },
                "help": "See the list of encampment types you can set up here. At the start of the game you know how to set up a basic cache with a few guards, which you can upgrade later to a more productive type."
            });
            thirdColumn.push(buildButton);
        }
    }


    if (true) {
        let useButton = await gameengine.getControl(state, {
            "type": "actButton",
            "display": "Use items",
            "verb": "setscene",
            "details": {
                "text": "",
                "type": "recombine",
                "name": "inventory",
                "sub": "use"
            },
            "help": "Use some of your items."
        });
        fourthColumn.push(useButton);
    }

    if (thirdColumn.length)
        controls[2] = thirdColumn;
    if (fourthColumn.length)
        controls[3] = fourthColumn;
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
            { "text": healthText, "help": "Health.\nWhen your health drops to zero, you will be force to rewind to your last rest point. Over time, nutrition converts to stamina and then to health.",
        isPercent: true, leftVal: leader.health, rightVal: leader.maxHealth - leader.health, leftColor: "#FF0000", rightColor: "#884444" },
            { "text": staminaText, "help":"Stamina.\nWhen your stamina drops to zero, you will need to digest food to recover. Some actions spend stamina, and also it converts to health over time.",
            isPercent: true, leftVal: leader.stamina, rightVal: leader.maxStamina - leader.stamina, leftColor: "#FFFF00", rightColor: "#b98d29"},
            { "text": nutritionText, "help": "Nutrition.\nEat food to fill up so you can recover and heal.",
            isPercent: true, leftVal: leader.nutrition, rightVal: leader.maxNutrition - leader.nutrition, leftColor: "#00FF00", rightColor: "#448844" },
            { "text": manaText, "help": "Mana.\nThe mystical energy that wells up within you over time." ,
            isPercent: true, leftVal: leader.mana, rightVal: leader.maxMana - leader.mana, leftColor: "#FF00FF", rightColor: "#884488"}
        ]
	};
	if (leader.activeassist) {
        statusDisplay.lines.push({
            "text": leader.activeassist.display, "help": "Active Assist:\n" + leader.activeassist.help
        });
    }
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
                workers: [],
                lastUpdated: 0
            }
        };
    }
    if (state.world.locations['Dragonbone Cave'][0][5][4].building.workers == {}) {
        state.world.locations['Dragonbone Cave'][0][5][4].building.workers = [];
    }
    if (state.parties[0]) {
        if (!state.parties[0].leader.maxpawnassist)
            state.parties[0].leader.maxpawnassist = 4;
        if (!state.parties[0].leader.tags) {
            let leaderDef = await cache.load(`data/characters/${state.parties[0].leader.name}.json`);
            state.parties[0].leader.tags = Object.assign({}, leaderDef.tags);
        }
        if (!state.parties[0].leader.damageMultiplier) {
            state.parties[0].leader.damageMultiplier = { "fire": 0 };
        }
        if (!state.parties[0].leader.colorclass) {
            state.parties[0].leader.colorclass = "red";
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
    let oldState = await gameengine.rewind(state);
    await setDefaults(oldState);
    // TODO: run any pending migrations.

    let archive = state.archive;

    for (var prop in state) { if (state.hasOwnProperty(prop)) { delete state[prop]; } }
    Object.assign(state, oldState);
    state.archive = archive; // preserve linking. TODO: support jumping back multiple steps. Rewind handles this but what about linking?
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