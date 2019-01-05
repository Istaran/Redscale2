
var fs = require('fs');

var cache = {};

let load = function (path) {
	if (cache[path] === undefined) {
		cache[path] = new Promise(function(resolve, reject) {
			
			fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
				if (err) {
					console.log(err);
					resolve(null);
				} else {
					resolve(JSON.parse(data));
				}
			});
		});
	}
	return cache[path];
};

let newGamePath = './data/newGame.json';
load(newGamePath);
let saveMigrationPath = './data/saveMigrations.json';
load(saveMigrationPath);

let save = function (path, value) {
	let old = cache[path];
	
	cache[path] = new Promise(function (resolve, reject) {
		let writeValue = function () { fs.writeFile(path, JSON.stringify(value), {encoding: 'utf8'}, (err) => {if (err) console.log(err); resolve(value); });};
		if (old) {
			old.then(writeValue);
		} else {
			writeValue();
		}					
	});
}

let view = async function (state) {
	return { status: "View state not implemented yet.", controls: [] };
}

let act = async function (action) {
	console.log(action);
	let savePath = './saves/' + action.username + '.json';
	
	// Load current existence.
	let state = await load(savePath);
	if (state == null) {
		state = await load(newGamePath);
	}
	let migrations = await load(saveMigrationPath);
	
	while (state["save version"] < migrations.length) {
		let change = migrations[state["save version"]];
		// TODO: apply change. There are no migrations yet, though, so we're okay.
		state["save version"]++;
	}
	
	// Apply action
	switch (action.type) {
		
		default:
		// No-op / pure load / status checked
	}
	
	// Save current state;
	save(savePath, state);
	
	return view(state);
};

module.exports = {
	act: act
};