const gameengine = require('../gameengine');
const cache = require('../cache');

let act = async function (state, details) {
	let itemDef = await cache.load(`./data/items/${details.item}.json`);
	let quantity = details.count;
    let newCountText;
    state.parties[state.activeParty].inventory[details.item] = (state.parties[state.activeParty].inventory[details.item] || 0) - quantity;
    if (!details.allowNegative && state.parties[state.activeParty].inventory[details.item] < 0) {
        state.parties[state.activeParty].inventory[details.item] = undefined;
        console.log(`Paid ${quantity} x ${itemDef.display} and clipped up to zero from negative.`);
        newCountText = "none";
    } else if (state.parties[state.activeParty].inventory[details.item] == 0) {
        state.parties[state.activeParty].inventory[details.item] = undefined;
        console.log(`Paid ${quantity} x ${itemDef.display} and ended up with none.`);
        newCountText = "none";
    } else {
        console.log(`Paid ${quantity} x ${itemDef.display} and have ${state.parties[state.activeParty].inventory[details.item]} left.`);
        newCountText = state.parties[state.activeParty].inventory[details.item];
    }
    if (details.text)
        gameengine.displayText(state, details.text + "\n", 100);
    gameengine.displayText(state, `Removed ${quantity} x ${itemDef.display} from your inventory. You have ${newCountText} left on you.`, details.pause || 100);
};

module.exports = {
	act: act
};