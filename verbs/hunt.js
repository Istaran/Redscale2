const combatengine = require('../combatengine');
const gameengine = require('../gameengine');

let act = async function (state, details) {
    let target = await gameengine.randomChoice(state, details.targets);
    gameengine.displayText(state, await combatengine.configureEnemy(state, target.name, "hunt"), details.pause || 100);
};

module.exports = {
	act: act
};