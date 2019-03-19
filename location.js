var cache = require('./cache');

let spotExists = function(zone, x, y, z) {
	return (zone && zone.map && zone.map[z] && zone.map[z][y] && zone.map[z][y][x]);
}

let getSpotDetails = function(zone, x, y, z, dir) {
	let spot = zone.map[z][y][x];
	let style = zone.styles[spot];
	return {direction: dir, preview: style.preview};
}

let getControls = async function (state) {
	let zone = await cache.load('./data/locations/' + state.location + '.json');
	let controls = [[{type:"navigator", details:{}}],[]];
	if (spotExists(zone, state.x, state.y, state.z + 1)) controls[0][0].details.up = getSpotDetails(zone, state.x, state.y, state.z + 1, "up");
	if (spotExists(zone, state.x, state.y - 1, state.z)) controls[0][0].details.north = getSpotDetails(zone, state.x, state.y - 1, state.z, "north");
	if (spotExists(zone, state.x + 1, state.y, state.z)) controls[0][0].details.east = getSpotDetails(zone, state.x + 1, state.y, state.z, "east");
	if (spotExists(zone, state.x - 1, state.y, state.z)) controls[0][0].details.west = getSpotDetails(zone, state.x - 1, state.y, state.z, "west");
	if (spotExists(zone, state.x, state.y + 1, state.z)) controls[0][0].details.south = getSpotDetails(zone, state.x, state.y + 1, state.z, "south");
	if (spotExists(zone, state.x, state.y, state.z - 1)) controls[0][0].details.down = getSpotDetails(zone, state.x, state.y, state.z - 1, "down");
	
	if (spotExists(zone, state.x, state.y, state.z)) {
		let spot = zone.map[state.z][state.y][state.x];
		let style = zone.styles[spot];
		
		if (style.actions) {
			style.actions.forEach((action) => controls[1].push(zone.actions[action]));
		}
	} else {
		// If someone ends up stuck in a wall, so to speak, add a location reset button.
		 controls[0][0].details.special = {location:"Dragonbone Cave", x:4, y:5, z:0, help:"Debug warp to home.", preview:"You see your home through the mysterious portal of Ooops, how'd you get somewhere that isn't adjacent to anywhere?!"};
	}
	return controls;
};

let explore = async function (state) {
	let zone = await cache.load('./data/locations/' + state.location + '.json');
	//Temp:
	if (spotExists(zone, state.x, state.y, state.z)) {
		let spot = zone.map[state.z][state.y][state.x];
		let style = zone.styles[spot];
		state.view.status = style.description;
	} else {
		state.view.status = "Ooops, you somehow ended up outside reality.";
	}
};

module.exports = {
	explore: explore,
	getControls: getControls
};