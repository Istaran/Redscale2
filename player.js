// Future note: GameEngine reference will be needed eventually. it needs to lazy load like location.js does, because of circular dependency.
let cache = require('./cache');
let loc = require('./location');

let addControls = function (state, controls) {
	// TODO
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

let setDefaults = function (state) {
    // Backfill default values not already in the save. Difference between this and migrations is migrations are to change existing data that has been transformed or rebalanced.
    if (!state.world) {
        state.world = {
            locations: {}
        }
    }
    if (!state.parties[0].leader.maxpawnassist)
        state.parties[0].leader.maxpawnassist = 4;
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
    setDefaults(oldState);
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