
var cache = require('./cache');

let newGamePath = './data/newGame.json';
cache.load(newGamePath);
let saveMigrationPath = './data/saveMigrations.json';
cache.load(saveMigrationPath);

var conditions = {};
var verbs = {};

var combat = require('./combatengine');
var scenes = require('./sceneengine');
var loc = require('./location');
var player = require('./player');
var time = require('./time');

let doVerb = async function (verbName, state, details) {
    if (verbs[verbName] === undefined) {
        try {
            verbs[verbName] = require(`./verbs/${verbName}`);
        } catch (e) {
            console.log(`Couldn't load verb ${verbName}`);
            console.log(e);
            verbs[verbName] = null;
        }
    }
    if (verbs[verbName]) {
        if (details && details.dirty) state.dirty = true;
        await verbs[verbName].act(state, details);
    }
}

let conditionMet = async function (state, details) {
    if (!details) return true; // Default pass for no condition
    let conditionName = details.condition;
    if (conditions[conditionName] === undefined) {
        try {
            conditions[conditionName] = require(`./conditions/${conditionName}`);
        } catch (e) {
            conditions[conditionName] = null;
        }
    }
    if (conditions[conditionName]) {
        console.log(`Questioning:${conditionName}\n${JSON.stringify(details)}`);
        let result = await conditions[conditionName].satisfied(state, details);
        console.log(`Answer: ${result}`);
        return result;
    }
    console.log(`Condition ${conditionName} failed because no JS file`);
    return false; // Lack of js file is a fail.
}

let getContext = function (state, context) {
    switch (context) {
        case "party":
            return state.parties[state.activeParty];
        case "location":
            // Make sure state.locations.<zone>.<z>.<y>.<x> exists, and return it as a context
            let locations = state.world.locations;
            if (!locations[state.location])
                locations[state.location] = {};
            let location = locations[state.location];
            if (!location[state.z]) location[state.z] = {};
            let locZ = location[state.z];
            if (!locZ[state.y]) locZ[state.y] = {};
            let locY = locZ[state.y];
            if (!locY[state.x]) locY[state.x] = {};
            return locY[state.x];
        default:
            console.log(`Invalid context: ${context}\nState:${JSON.stringify(state)}`);
            throw "Invalid context";
    }
}

let getRequantifierDisplay = async function (name, dataset) {
    var data;
    switch (dataset) {
        // This helper needs to know where to find the source and what the display type is.
        case "inventory":
            let item = await cache.load(`data/items/${name}.json`);
            data = { "type": "item", "text": item.cardtext };
            break;
    }

    return data;
}

// Does situational processing for a permanently defined control.
let getControl = async function (state, details) {
    if (!details) return null;
    if (!(await conditionMet(state, details.visible))) return null;
    let ctrl = JSON.parse(JSON.stringify(details)); // Deep copy
    ctrl.enabled = await conditionMet(state, details.enabled);

    if (ctrl.type == "requantifier") {
        // setup the numbers based on context/dataset
        let leftContext = getContext(state, details.details.leftDataContext);
        if (!leftContext[details.details.dataset]) leftContext[details.details.dataset] = {};
        ctrl.leftCounts = leftContext[details.details.dataset];
        let rightContext = getContext(state, details.details.rightDataContext);
        if (!rightContext[details.details.dataset]) rightContext[details.details.dataset] = {};
        ctrl.rightCounts = rightContext[details.details.dataset];
        ctrl.displays = {};
        var name;
        for (name in ctrl.leftCounts) {            
            ctrl.displays[name] = await getRequantifierDisplay(name, details.details.dataset);
        }
        for (name in ctrl.rightCounts) {
            if (ctrl.displays[name] === undefined) 
                ctrl.displays[name] = await getRequantifierDisplay(name, details.details.dataset);
        }
    }

    return ctrl;
}

let controls = async function (state) {

    let controls = null;
	if (state.scene2 !== undefined) {
		controls = await scenes.getControls(state, state.scene2);
	} else if (state.enemy !== undefined) {
        controls = await combat.getControls(state);
	} else if (state.scene !== undefined) {
        controls = await scenes.getControls(state, state.scene);
	} else {
		controls = await loc.getControls(state);
		await player.addControls(state, controls);
		// Get description from location, and combine controls from location and player modules.
    }	
    let id = Date.now() % 100000;

    let details = {};
    for (var col = 0; col < controls.length; col++) {
        let column = controls[col];
        if (column) {
            for (var row = 0; row < column.length; row++) {
                if (column[row]) {
                    details[id] = column[row].details;
                    column[row].details = undefined;
                    column[row].id = id++;
                }
            }
        }
    }

    state.details = details;
    state.view.controls = controls;
}

let list = async function (profile) {
    console.log(`Getting list for ${profile.id}`);
    var saveDir = `./saves/${profile.id}`;
    var savePaths = await cache.loadDir(saveDir);
    var previews = [];
    for (var i = 0; i < savePaths.length; i++) {
        let path = savePaths[i];
        let data = await cache.load(`${saveDir}/${path}`);
        let subPath = path.substring(0, path.length - 5);
        previews.push({
            slot: subPath,
            text: await player.getSavePreview(data)
        });
    }
    return previews;
}

let act = async function (profile, action, query) {
    console.log(action);
    let savePath = `./saves/${profile.id}/${action.slot}.json`;

    // Load current existence.
    let state = await cache.load(savePath);
    if (state == null) {
        state = await cache.load(newGamePath);
    }
    state.query = query;
    await player.setDefaults(state);

    let migrations = await cache.load(saveMigrationPath);

    while (state["save version"] < migrations.length) {
        let change = migrations[state["save version"]];
        // TODO: apply change. There are no migrations yet, though, so we're okay.
        state["save version"]++;
    }

    // Apply action
    if (action.id && state.details[action.id]) {
        state.dirty = undefined;
        state.view = {};
        let details = (action.sub ? state.details[action.id][action.sub] : state.details[action.id]);
        state.data = action.data;
        await doVerb(action.verb, state, details);
    } else {
        await doVerb("status", state, null);
    }

    await controls(state);

    //Determine which character should be shown on left. By default, it's the player
    state.view.leftStatus = player.getStatusDisplay(state);

    //Determine which character should be shown on right. By default, it's none.
    if (state.enemy) {
        state.view.rightStatus = await require('./combatengine').getStatusDisplay(state);
    } else {
        state.view.rightStatus = null;
    }

    state.view.title = `${await loc.getTitle(state)} - ${time.getTimeString(state)}`;
	
	// Save current state;
	cache.save(savePath, state);
	
	return state.view;
};

// Choices is an array. Each element is an object with a chance (number), and possibly an if (condition). 
let randomChoice = async function (state, choices) {
    let choiceList = choices ? choices.slice() : [];
    let maxChance = 0, i = 0;
    for (; i < choiceList.length; i++) {
        if (await conditionMet(state, choiceList[i].if)) {
            maxChance += choiceList[i].chance;
        } else {
            choiceList.splice(i, 1);
            i--; // to counter the default i++.
       }
    }
    let roll = Math.random() * maxChance;
    console.log(`Rolled: ${Math.floor(roll) + 1} of ${maxChance}`);
    // Doing the simple method for now, may re-implement the Redscale's version someday.
    for (i = 0; roll > choiceList[i].chance; roll -= choiceList[i].chance, i++) { }

    return choiceList[i];
};

module.exports = {
    act: act,
    conditionMet: conditionMet,
    getContext: getContext,
    doVerb: doVerb,
    getControl: getControl,
    list: list,
    randomChoice: randomChoice
};