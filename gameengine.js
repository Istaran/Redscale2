
var cache = require('./cache');

let newGamePath = './data/newGame.json';
cache.load(newGamePath);
let saveMigrationPath = './data/saveMigrations.json';
cache.load(saveMigrationPath);

var conditions = {};
var verbs = {};

var loc = require('./location');
var player = require('./player');

let doVerb = async function (verbName, state, details) {
    if (verbs[verbName] === undefined) {
        try {
            verbs[verbName] = require('./verbs/' + verbName);
        } catch (e){
            verbs[verbName] = null;
        }
    }
    if (verbs[verbName]) {
        await verbs[verbName].act(state, details);
    }
}

let conditionMet = async function (state, details) {
    if (!details) return true; // Default pass for no condition
    let conditionName = details.condition;
    if (conditions[conditionName] === undefined) {
        try {
            conditions[conditionName] = require('./conditions/' + conditionName);
        } catch (e) {
            condtions[conditionName] = null;
        }
    }
    if (conditions[conditionName]) {
        console.log("Questioning:" + conditionName + "\n" + JSON.stringify(state) + "\n" + JSON.stringify(details));
        let result = await conditions[conditionName].satisfied(state, details);
        console.log("Answer: " + result);
        return result;
    }
    console.log("Condition " + conditionName + "failed because no JS file");
    return false; // Lack of js file is a fail.
}

// Does situational processing for a permanently defined control.
let getControl = async function (state, details) {
    if (!details) return null;
    if (!(await conditionMet(state, details.visible))) return null;
    let ctrl = JSON.parse(JSON.stringify(details)); // Deep copy
    ctrl.enabled = await conditionMet(state, details.enabled);
    return ctrl;
}

let controls = async function (state) {
	if (state.event2 !== undefined) {
		return state.event2.getControls();
	} else if (state.enemy !== undefined) {
		return [];
	} else if (state.event !== undefined) {
		return state.event.getControls();
	} else {
		let controls = await loc.getControls(state);
		player.addControls(state, controls);
		// Get description from location, and combine controls from location and player modules.
		return controls;		
	}	
}

let act = async function (action, query) {
	console.log(action);
	let savePath = './saves/' + action.username + '.json';
	
	// Load current existence.
	let state = await cache.load(savePath);
	if (state == null) {
		state = await cache.load(newGamePath);
    }
    state.query = query;
	let migrations = await cache.load(saveMigrationPath);
	
	while (state["save version"] < migrations.length) {
		let change = migrations[state["save version"]];
		// TODO: apply change. There are no migrations yet, though, so we're okay.
		state["save version"]++;
	}
	
	// Apply action
    await doVerb(action.verb, state, action.details);
	
	state.view.controls = await controls(state);

	//Determine which character should be shown on left. By default, it's the player
	state.view.leftStatus = player.getStatusDisplay();
	
	//Determine which character should be shown on right. By default, it's none.
	state.view.rightStatus = null;
	
	// Save current state;
	cache.save(savePath, state);
	
	return state.view;
};

module.exports = {
    act: act,
    conditionMet: conditionMet,
    doVerb: doVerb,
    getControl: getControl
};