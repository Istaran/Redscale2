const combatengine = require('../combatengine');
const gameengine = require('../gameengine');

let act = async function (state, details) {
    gameengine.displayText(state, await combatengine.configureEnemy(state, details.enemy, "attack"), details.pause || 100);
};


module.exports = {
    act: act
};