var cache = require('./cache');

let spotExists = function(zone, x, y, z) {
	return (zone && zone.map && zone.map[z] && zone.map[z][y] && zone.map[z][y][x]);
}

let getControls = async function (state) {
	let zone = await cache.load('./data/locations/' + state.location + '.json');
	let controls = [[{type:"navigator", details:{}}],[]];
	if (spotExists(zone, state.x, state.y, state.z + 1)) controls[0][0].details.up = {direction:"up"};
	if (spotExists(zone, state.x, state.y - 1, state.z)) controls[0][0].details.north = {direction:"north"};
	if (spotExists(zone, state.x + 1, state.y, state.z)) controls[0][0].details.east = {direction:"east"};
	if (spotExists(zone, state.x - 1, state.y, state.z)) controls[0][0].details.west = {direction:"west"};
	if (spotExists(zone, state.x, state.y + 1, state.z)) controls[0][0].details.south = {direction:"south"};
	if (spotExists(zone, state.x, state.y, state.z - 1)) controls[0][0].details.down = {direction:"down"};
	
	if (spotExists(zone, state.x, state.y, state.z)) {
		let spot = zone.map[state.z][state.y][state.x];
		let style = zone.styles[spot];
		
		if (style.controls) {
			controls[1].concat(style.controls);
		}
	} else {
		// If someone ends up stuck in a wall, so to speak, add a location reset button.
		 controls[0][0].details.special = {location:"Dragonbone Cave", x:4, y:5, z:0};
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