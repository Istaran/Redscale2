
var cache = require('./cache');

let newGamePath = './data/newGame.json';
cache.load(newGamePath);
let saveMigrationPath = './data/saveMigrations.json';
cache.load(saveMigrationPath);

var conditions = {};
var verbs = {};
var calcs = {};

var combat = require('./combatengine');
var scenes = require('./sceneengine');
var loc = require('./location');
var player = require('./player');
var time = require('./time');

let doVerb = async function (verbName, state, details) {
    console.log(`Do: ${verbName} (${details ? JSON.stringify(details) : ""})`)
    if (verbs[verbName] === undefined) {
        try {
            verbs[verbName] = require(`./verbs/${verbName}`);
        } catch (e) {
            console.log(`Couldn't load verb ${verbName}`);
            console.log(e);
            verbs[verbName] = null;
        }
    }
    var oldContextScrubbers = state.contextScrubbers;
    var oldContextTags = state.contextTags;
    if (verbs[verbName]) {        
        if (details) {        
            if (details.dirty) state.dirty = true;

            var tags = oldContextTags;
            var contextScrubbers = oldContextScrubbers;
            switch (details.scrubcontext) {
                case "enemy":
                    tags = state.enemy.tags;
                    contextScrubbers = state.enemy.scrubbers;
                    break;
                case "character":
                    console.log("Scrubbing text based on character: " + details.scrubcharacter);
                    if (details.scrubcharacter) {
                        if (state.world && state.world.characters && state.world.characters[details.scrubcharacter]) {
                            tags = state.world.characters[details.scrubcharacter].tags || {};
                            contextScrubbers = state.world.characters[details.scrubcharacter].scrubbers || {};
                            console.log(`Scrubbers: ${JSON.stringify(contextScrubbers)}\nTags:${JSON.stringify(tags)}`);
                        }
                    }
                    break;
            }
            state.contextTags = tags;
            state.contextScrubbers = contextScrubbers;
        }
        await verbs[verbName].act(state, details);
        // restore outer context
        state.contextScrubbers = oldContextScrubbers;
        state.contextTags = oldContextTags;
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

let calculate = async function (state, calc) {
    console.log(`Calculate: ${JSON.stringify(calc)}`);

    if (calc.calc === undefined) return calc; // Shortcircuit to return literals and whatnot.
    if (calcs[calc.calc] === undefined) {
        try {
            calcs[calc.calc] = require(`./calcs/${calc.calc}`);
        } catch (e) {
            console.log(`Couldn't load calculator ${calc.calc}`);
            console.log(e);
            calcs[calc.calc] = null;
        }
    }
    if (calcs[calc.calc]) {
        let val = await calcs[calc.calc].value(state, calc);
        console.log(`Calculated: ${val}`);
        return val;
    }
    console.log("Cannot calculate");
}

let getContext = function (state, context) {
    if (!context) return state; 
    var contextPath = context.split("/");
    switch (contextPath[0]) {
        case null:
        case undefined:
            return state;
        case "party":
            if (contextPath[1])
                return state.parties[contextPath[1]]; // Maybe? I will probably need more logic here.
            return state.parties[state.activeParty];
        case "location":
            let L = (contextPath[1] || state.location);
            let Z = (contextPath[2] || state.z);
            let Y = (contextPath[3] || state.y);
            let X = (contextPath[4] || state.x);
            // Make sure state.locations.<zone>.<z>.<y>.<x> exists, and return it as a context
            let locations = state.world.locations;
            if (!locations[L])
                locations[L] = {};
            let location = locations[L];
            if (!location[Z]) location[Z] = {};
            let locZ = location[Z];
            if (!locZ[Y]) locZ[Y] = {};
            let locY = locZ[Y];
            if (!locY[X]) locY[X] = {};
            return locY[X];
        default:
            console.log(`Invalid context: ${context}\nState:${JSON.stringify(state)}`);
            throw "Invalid context";
    }
}

let getRequantifierDisplay = async function (name, type) {
    var data;
    switch (type) {
        // This helper needs to know where to find the source and what the display type is.
        case "item":
            let item = await cache.load(`data/items/${name}.json`);
            data = { "type": "item", "text": item.cardtext };
            break;
        default:
            let cards = await cache.load(`data/combat/${type} cards.json`);
            if (!cards) console.log(`getRequantifierDisplay doesn't know how to load card type ${type}`);
            else data = {
                "type": type, "text": cards[name].cardlines
            };
    }

    return data;
}

let getReassignerDisplay = async function (thing, type) {
    var data;
    switch (type) {
        case "pawn":
            let pawnDef = await cache.load(`data/pawns/${thing.name}.json`);
            data = {
                leftCards: pawnDef.assistcards.slice(),
                rightCards: [Object.assign({ subtype: "worker" }, pawnDef.workercard)],
                tags: thing.tags,
                display: thing.display
            }
    }

    return data;
}

getRecombinerDisplay = async function (thing, type) {
    console.log(`Getting representation for ${type}: ${JSON.stringify(thing)}`);
    var data = null;
    switch (type) {
        // This helper needs to know where to find the source and what the display type is.
        case "item":
            let item = await cache.load(`data/items/${thing}.json`);
            if (item.use) {
                data = { "type": "item", "text": item.cardtext };
            }
                break;
        case "pawn":
            let pawnDef = await cache.load(`data/pawns/${thing.name}.json`);
            data = {
                "type": "pawn",
                "text": `${pawnDef.display}\n\nHealth: ${thing.health} / ${pawnDef.maxHealth}\nNutrition: ${thing.nutrition || 0} / ${pawnDef.maxNutrition}`
            };
            break;
        case "leader":
            let leaderDef = await cache.load(`data/characters/${thing.name}.json`);
            data = {
                "type": "player",
                "text": `${thing.display}\n${leaderDef.description}\n\nHealth: ${thing.health} / ${thing.maxHealth}\nStamina: ${thing.stamina} / ${thing.maxStamina}\nMana: ${thing.mana} / ${thing.maxMana}\nNutrition: ${thing.nutrition} / ${thing.maxNutrition}`
            }
            break;
        default:
            console.log(`getRecombinerDisplay doesn't know how to show type ${type}`);
    }

    return data;
}

// Does situational processing for a permanently defined control.
let getControl = async function (state, details) {
    if (!details) return null;
    if (!(await conditionMet(state, details.visible))) return null;
    let ctrl = JSON.parse(JSON.stringify(details)); // Deep copy
    ctrl.enabled = await conditionMet(state, details.enabled);

    if (ctrl.type == "itemCount") {
        let counts = readContextPath(state, details.details.dataContext, details.details.path) || {};
        ctrl.display = details.details.display.replace('[count]', counts[details.details.item] || 0);
    }

    if (ctrl.type == "requantifier") {
        // setup the numbers based on context/dataset
        ctrl.leftCounts = readContextPath(state, details.details.leftDataContext, details.details.leftPath) || {};
        ctrl.rightCounts = readContextPath(state, details.details.rightDataContext, details.details.rightPath) || {};
        if(details.details.leftCheckContext && details.details.leftCheckPath)
            ctrl.leftChecks = readContextPath(state, details.details.leftCheckContext, details.details.leftCheckPath) || {};
        ctrl.displays = Object.assign({}, ctrl.leftCounts, ctrl.rightCounts); // initialize just to make sure we have all the props of left and right counts.
        for (var name in ctrl.displays) {            
            ctrl.displays[name] = await getRequantifierDisplay(name, details.details.type);
        }
    }

    if (ctrl.type == "reassigner") {
        ctrl.leftSet = readContextPath(state, details.details.leftDataContext, details.details.leftPath) || [];
        ctrl.rightSet = readContextPath(state, details.details.rightDataContext, details.details.rightPath) || [];
        ctrl.displays = [];
        var i;
        for (i = 0; i < ctrl.leftSet.length; i++) {
            ctrl.leftSet[i].displayIndex = ctrl.displays.length;
            ctrl.displays.push(await getReassignerDisplay(ctrl.leftSet[i], details.details.type));
        }
        for (i = 0; i < ctrl.rightSet.length; i++) {
            ctrl.rightSet[i].displayIndex = ctrl.displays.length;
            ctrl.displays.push(await getReassignerDisplay(ctrl.rightSet[i], details.details.type));
        }
    }

    if (ctrl.type == "recombiner") {
        console.log("Attempting to make recombiner");
        ctrl.leftSet = {};
        let leftSet = JSON.parse(JSON.stringify(readContextPath(state, "party", "inventory") || {}));
        ctrl.rightSet = [readContextPath(state, "party", "leader")];
        ctrl.rightSet = ctrl.rightSet.concat(readContextPath(state, "party", "pawns") || []);
        ctrl.displays = [];
        console.log(`Recombining\n${JSON.stringify(ctrl.leftSet)}\nwith\n${JSON.stringify(ctrl.rightSet)}`);
        for (var name in leftSet) {
            let display = await getRecombinerDisplay(name, "item");
            var count = leftSet[name];

            if (display) {
                ctrl.leftSet[name] = {
                    displayIndex: ctrl.displays.length,
                    count: count,
                };
                ctrl.displays.push(display);
            }
        }
        for (var i = 0; i < ctrl.rightSet.length; i++) {
            ctrl.rightSet[i].displayIndex = ctrl.displays.length;
            ctrl.displays.push(await getRecombinerDisplay(ctrl.rightSet[i], i == 0 ? "leader" : "pawn"));
        }
    }

    if (ctrl.display && ctrl.scrubcontext) {
        var tags = {};
        var contextScrubbers = null;
        switch (details.scrubcontext) {
            case "enemy":
                tags = state.enemy.tags;
                contextScrubbers = state.enemy.scrubbers;
                break;
            case "character":
                console.log("Scrubbing ctrl based on character: " + details.scrubcharacter);
                if (details.scrubcharacter) {
                    if (state.world && state.world.characters && state.world.characters[details.scrubcharacter]) {
                        tags = state.world.characters[details.scrubcharacter].tags || {};
                        contextScrubbers = state.world.characters[details.scrubcharacter].scrubbers || {};
                        console.log(`Scrubbers: ${JSON.stringify(contextScrubbers)}\nTags:${JSON.stringify(tags)}`);
                    }
                }
                break;
        }
        ctrl.display = await scrubText(state, ctrl.display, tags, contextScrubbers);
        if (ctrl.help) ctrl.help = await scrubText(state, ctrl.help, tags, contextScrubbers);
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
        if (path.endsWith(".json")) {
            let data = await cache.load(`${saveDir}/${path}`);
            let subPath = path.substring(0, path.length - 5);
            previews.push({
                slot: subPath,
                text: await player.getSavePreview(data)
            });
        }
    }
    return previews;
}

let act = async function (profile, action, query) {
    console.log(action);
    let savePath = `./saves/${profile.id}/${action.slot}.json`;

    // Load current existence.
    let state = await cache.load(savePath);
    if (state == null) {
        state = JSON.parse(JSON.stringify(await cache.load(newGamePath)));
    }
    state.archivepath = `./saves/${profile.id}/${action.slot}/archive/`;
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
        state.view = { display: []};
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
    state.view.id = profile.id;

    // apply display scrubbers
    for (let d = 0; d < state.view.display.length; d++) {
        let display = state.view.display[d];
        if (display.text) {
            display.text = await scrubText(state, display.text, display.tags, display.scrubbers);
            display.tags = undefined;
            display.scrubbers = undefined;
        }
    }
	
	// Save current state;
	cache.save(savePath, state);
	
	return state.view;
};

// Choices is an array. Each element is an object with a chance (number), and possibly an if (condition). 
let randomChoice = async function (state, choices) {
    let choiceList = choices ? choices.slice() : [];
    let chanceList = [];
    let maxChance = 0, i = 0;
    for (; i < choiceList.length; i++) {
        if (await conditionMet(state, choiceList[i].if)) {
            let chance = await calculate(state, choiceList[i].chance);
            chanceList.push(chance);
            maxChance += chance;
        } else {
            choiceList.splice(i, 1);
            i--; // to counter the default i++.
       }
    }
    let roll = Math.random() * maxChance;
    console.log(`Rolled: ${Math.floor(roll) + 1} of ${maxChance}`);
    // Doing the simple method for now, may re-implement the Redscale's version someday.
    for (i = 0; roll > chanceList[i]; roll -= chanceList[i], i++) { }

    return choiceList[i];
};

let readContextPath = function(state, context, path) {
    let contextRoot = getContext(state, context);
    let splitPath = path.split('/');
    let subState = contextRoot;
    
    for (var i = 0; i < splitPath.length - 1; i++) {
        if (!subState[splitPath[i]]) return undefined;
        subState = subState[splitPath[i]];
    }
    return subState[splitPath[i]]; // Final bit of mapping.
};

let writeContextPath = function (state, context, path, value) {
    let contextRoot = getContext(state, context);
    let splitPath = path.split('/');
    let subState = contextRoot;

    for (var i = 0; i < splitPath.length - 1; i++) {
        if (!subState[splitPath[i]]) subState[splitPath[i]] = {};
        subState = subState[splitPath[i]];
    }
    subState[splitPath[i]] = value;
}

let archive = async function (state) {
    let display = state.view.display; 
    state.view.display = [{type:"text", "text": "You restore the previous moment of time."}];
    let timestamp = Date.now();
    await cache.save(`${state.archivepath}${timestamp}.json`, JSON.parse(JSON.stringify(state)));
    state.archive = timestamp;
    state.view.display = display;
}

let rewind = async function (state, recurse) {
    recurse = (recurse || 0) + 1;
    while (state.archive && recurse) {
        state = await cache.load(`${state.archivepath}${state.archive}.json`);
        recurse--;
    }
    return state;
}

let textify = function (tagmap, tags, fallback) {
    for (var tag in tagmap) {
        if (tags[tag]) {
            return tagmap[tag];
        }
    }    
    return fallback;
}

let scrubText = async function (state, text, contextTags, contextScrubbers) {
    if (contextTags === undefined) contextTags = {};
    let scrubbers = await cache.load("data/scrubbers.json");
    if (contextScrubbers) {
        for (var conscrub in contextScrubbers) {
            var markup = `{${conscrub}}`;
            var scrubbed = contextScrubbers[conscrub];
            if (typeof scrubbed !== 'string') {
                scrubbed = textify(scrubbed, contextTags, conscrub);
            }
            while (text.indexOf(markup) > -1) {
                console.log(`${markup} => ${scrubbed}`);
                text = text.replace(markup, scrubbed);
            }
            while (text.indexOf(markup.toLowerCase()) > -1) {
                console.log(`${markup.toLowerCase()} => ${scrubbed.toLowerCase()}`);
                text = text.replace(markup.toLowerCase(), scrubbed.toLowerCase());
            }
        }
    }

    for (var scrub in scrubbers) {
        markup = `{${scrub}}`;
        scrubbed = scrubbers[scrub];
        if (typeof scrubbed !== 'string') {
            scrubbed = textify(scrubbed, contextTags, scrub);
        }
        while (text.indexOf(markup) > -1)
            text = text.replace(markup, scrubbed);
        while (text.indexOf(markup.toLowerCase()) > -1)
            text = text.replace(markup.toLowerCase(), scrubbed.toLowerCase());
    }
    while (text.indexOf('{') > -1)
        text = text.replace('{', '');
    while (text.indexOf('}') > -1)
        text = text.replace('}', '');
    return text;
}

let displayText = function(state, text, pauseAfterMs, contextTags, contextScrubbers) {
    if (text)
        state.view.display.push(
            {
                type: "text",
                text: text,
                pause: pauseAfterMs,
                tags: contextTags || state.contextTags,
                scrubbers: contextScrubbers || state.contextScrubbers
            }
        );
}

let map = async function (profile, slot) {
    console.log(`Creating map for ${profile.id}/${slot}`);
    let savePath = `./saves/${profile.id}/${slot}.json`;

    // Load current existence.
    let state = await cache.load(savePath);
    if (!state) return false;

    return loc.map(state);
}

module.exports = {
    act: act,
    conditionMet: conditionMet,
    getContext: getContext,
    doVerb: doVerb,
    calculate: calculate,
    archive: archive,
    rewind: rewind,
    getControl: getControl,
    list: list,
    randomChoice: randomChoice,
    readContextPath: readContextPath,
    writeContextPath: writeContextPath,
    scrubText: scrubText,
    displayText: displayText,
    map: map
};