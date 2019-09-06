let cache = require('../cache');

let act = async function (state, details) {
	let itemDef = await cache.load(`./data/items/${details.item}.json`);
	let quantity = details.count;
    state.parties[state.activeParty].inventory[details.item] = (state.parties[state.activeParty].inventory[details.item] || 0) - quantity;
    if (!details.allowNegative && state.parties[state.activeParty].inventory[details.item] < 0) {
        state.parties[state.activeParty].inventory[details.item] = undefined;
        console.log(`Paid ${quantity} x ${itemDef.display} and clipped up to zero from negative.`);
    } else if (state.parties[state.activeParty].inventory[details.item] == 0) {
        state.parties[state.activeParty].inventory[details.item] = undefined;
        console.log(`Paid ${quantity} x ${itemDef.display} and ended up with none.`);
    } else {
        console.log(`Paid ${quantity} x ${itemDef.display} and have ${state.parties[state.activeParty].inventory[details.item]} left.`);
    }
    state.view.status = `${details.text ? details.text + "\n" || ""}Removed ${quantity} x ${itemDef.display} from your inventory.`;
};


module.exports = {
	act: act
};