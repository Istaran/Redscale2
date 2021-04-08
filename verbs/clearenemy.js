const combatengine = require('../combatengine');
const gameengine = require('../gameengine');
const loc = require('../location');

let act = async function (state, details) {
    await combatengine.clearCombat(state);
    if (details.text)
        gameengine.displayText(state, details.text, details.pause || 100);
    gameengine.displayText(state, await loc.getDescription(state), 100);
    console.log("Cleared enemy");
} 

module.exports = {
    act: act
};