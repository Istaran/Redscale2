var combatengine = require('../combatengine');
var loc = require('../location');

let act = async function (state, details) {
    await combatengine.clearCombat(state);
    state.view.status = details.text + await loc.getDescription(state);
    console.log("Cleared enemy");
}


module.exports = {
    act: act
};