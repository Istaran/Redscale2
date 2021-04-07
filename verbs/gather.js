const gameengine = require('../gameengine');
const cache = require('../cache');

let act = async function (state, details) {
	let itemDef = await cache.load(`./data/items/${details.item}.json`);
	let quantity = details.plus;
	for (var d = 0; d < details.dice; d++) quantity += Math.floor(Math.random() * details.die) + 1;
	var possessed = state.parties[state.activeParty].inventory[details.item] || 0;
	possessed += quantity;
	state.parties[state.activeParty].inventory[details.item] = possessed;
    
	gameengine.displayText(state, details.text + "\n" , details.pause || 100);	
	gameengine.displayText(state, `Added ${quantity} x ${itemDef.display} to your inventory. You now have ${possessed} with you.`, details.pause || 100);
    console.log(`Got ${quantity} x ${itemDef.display}`)
};


module.exports = {
	act: act
};