var combatengine = require('../combatengine');
var gameengine = require('../gameengine');

let act = async function (state, details) {
    let target = await gameengine.randomChoice(state, details.targets);
    
    return await combatengine.configureEnemy(state, target.name, "hunt");
};


module.exports = {
	act: act
};