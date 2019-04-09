let cache = require('./cache');
var gameengine = undefined;

let spotExists = function(zone, x, y, z) {
	return (zone && zone.map && zone.map[z] && zone.map[z][y] && zone.map[z][y][x]);
}

let getSpotDetails = function(zone, x, y, z) {
	let spot = zone.map[z][y][x];
	let style = zone.styles[spot];
	return style.preview;
}

let setupDirection = async function (loc, zone, x, y, z, dir, control, hereStyle) {
    let overrided = hereStyle.directionOverrides && hereStyle.directionOverrides[dir];
    let over = (overrided ? hereStyle.directionOverrides[dir] : {}); // Direction override pretends 'here' is in the zone specified and offset by dimensions specified for purpose of calculating links in the given direction.
    let targetZone = zone;
    if (over.zone) targetZone = await cache.load(`./data/locations/${over.zone}.json`);
    let targetX = x + (over.x || 0);
    let targetY = y + (over.y || 0);
    let targetZ = z + (over.z || 0);

    switch (dir) {
        case "up": targetZ += 1; break;
        case "north": targetY -= 1; break;
        case "east": targetX += 1; break;
        case "west": targetX -= 1; break;
        case "south": targetY += 1; break;
        case "down": targetZ -= 1; break;
    }

    if (spotExists(targetZone, targetX, targetY, targetZ)) {
        control.sub[dir] = getSpotDetails(targetZone, targetX, targetY, targetZ);
        if (!overrided)
            control.details[dir] = { direction: dir };
        else
            control.details[dir] = { location: (over.zone || loc), x: targetX, y: targetY, z: targetZ };
    }

}

let getControls = async function (state) {
	let zone = await cache.load(`./data/locations/${state.location}.json`);
    let controls = [[{ type: "navigator", details: {}, sub: {} }], []];
    if (!gameengine) gameengine = require('./gameengine'); // Lazy load to avoid circular dependency problem.

	if (spotExists(zone, state.x, state.y, state.z)) {
		let spot = zone.map[state.z][state.y][state.x];
		let style = zone.styles[spot];

        await setupDirection(state.location, zone, state.x, state.y, state.z, "up", controls[0][0], style);
        await setupDirection(state.location, zone, state.x, state.y, state.z, "north", controls[0][0], style);
        await setupDirection(state.location, zone, state.x, state.y, state.z, "east", controls[0][0], style);
        await setupDirection(state.location, zone, state.x, state.y, state.z, "west", controls[0][0], style);
        await setupDirection(state.location, zone, state.x, state.y, state.z, "south", controls[0][0], style);
        await setupDirection(state.location, zone, state.x, state.y, state.z, "down", controls[0][0], style);

        if (style.actions) {
            for (var i = 0; i < style.actions.length; i++) {
                let ctrl = await gameengine.getControl(state, zone.actions[style.actions[i]]);
                if (ctrl)
                    controls[1].push(ctrl);
            }
		}
	} else {
		// If someone ends up stuck in a wall, so to speak, add a location reset button.
		 controls[0][0].details.special = {location:"Dragonbone Cave", x:4, y:5, z:0, help:"Debug warp to home.", preview:"You see your home through the mysterious portal of Ooops, how'd you get somewhere that isn't adjacent to anywhere?!"};
	}
	return controls;
};

let explore = async function (state) {
	let zone = await cache.load(`./data/locations/${state.location}.json`);
	//Temp:
	if (spotExists(zone, state.x, state.y, state.z)) {
        if (!gameengine) gameengine = require('./gameengine'); // Lazy load to avoid circular dependency problem.

        let spot = zone.map[state.z][state.y][state.x];
        let style = zone.styles[spot];

        // TODO: before checking random explore event, check for clock-based events.

        let randomEvent = await gameengine.randomChoice(state, style.events);

        if (randomEvent && randomEvent.event) {
            state.view.status = "";
            let event = zone.events[randomEvent.event];
            console.log(`Triggered random event: ${event.verb}: ${JSON.stringify(event.details)}`);
            await gameengine.doVerb(event.verb, state, event.details);
            state.view.status = `${style.description}\n\n${state.view.status}`;
        } else {
            state.view.status = style.description;
            // Nothing happens
        }

	} else {
		state.view.status = "Ooops, you somehow ended up outside reality.";
	}
};

module.exports = {
	explore: explore,
	getControls: getControls
};