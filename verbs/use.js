let cache = require('../cache');

let act = async function (state, details) {
    let user = state.parties[state.activeParty].leader;
    let userDef = user;

    if (state.data.user.type == "pawn") {
        user = state.parties[state.activeParty].pawns[state.data.user.index];
        userDef = await cache.load(`data/pawns/${user.name}.json`);
    }

    let itemDef = await cache.load(`data/items/${state.data.item}.json`);
    if (itemDef.use.nutrition) {
        user.nutrition = Math.min(itemDef.use.nutrition + (user.nutrition || 0), userDef.maxNutrition);
    }
    if (itemDef.use.healing) {
        user.health = Math.min(itemDef.use.healing + user.health, userDef.maxHealth);
    }
    if (itemDef.use.stamina) {
        user.stamina = Math.min(itemDef.use.stamina + user.stamina, userDef.maxStamina);
    }

    let inventory = state.parties[state.activeParty].inventory;
    inventory[state.data.item]--;
    if (inventory[state.data.item] == 0)
        inventory[state.data.item] = undefined;
};


module.exports = {
	act: act
};