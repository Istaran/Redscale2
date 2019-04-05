let cache = require('../cache');

let act = async function (state, details) {
let itemDef = await cache.load(`./data/items/${details.item}.json`);
    state.view.status = itemDef.gather + " (But nothing really happens because gathering isn't implemented yet)";
};


module.exports = {
	act: act
};