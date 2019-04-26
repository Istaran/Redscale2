let cache = require('../cache');

let act = async function (state, details) {
	let itemDef = await cache.load(`./data/items/${details.item}.json`);
	let quantity = details.plus;
	for (var d = 0; d < details.dice; d++) quantity += Math.floor(Math.random() * details.die) + 1;
	state.parties[state.activeParty].inventory[details.item] = (state.parties[state.activeParty].inventory[details.item] || 0) + quantity;
    state.view.status = `${details.text}\nAdded ${quantity} x ${itemDef.display} to your inventory.`;
	
};


module.exports = {
	act: act
};