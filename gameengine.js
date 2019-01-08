
var cache = require('./cache');

let newGamePath = './data/newGame.json';
cache.load(newGamePath);
let saveMigrationPath = './data/saveMigrations.json';
cache.load(saveMigrationPath);

var verbs = {
	travel: require('./verbs/travel')
};

var loc = require('./location');
var player = require('./player');

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

let act = async function (action) {
	console.log(action);
	let savePath = './saves/' + action.username + '.json';
	
	// Load current existence.
	let state = await cache.load(savePath);
	if (state == null) {
		state = await cache.load(newGamePath);
	}
	let migrations = await cache.load(saveMigrationPath);
	
	while (state["save version"] < migrations.length) {
		let change = migrations[state["save version"]];
		// TODO: apply change. There are no migrations yet, though, so we're okay.
		state["save version"]++;
	}
	
	// Apply action
	if (verbs[action.verb] !== undefined) {
		await verbs[action.verb].act(state, action.details);
	}
	
	if (action.verb != 'status')
		state.view.controls = await controls(state); // Status preserves the existing view
	
	// Save current state;
	cache.save(savePath, state);
	
	return state.view;
};

module.exports = {
	act: act
};