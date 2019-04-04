var combatengine = require('../combatengine');

let act = async function (state, details) {

    combatengine.configureEnemy(state, details.enemy, "attack");
};


module.exports = {
    act: act
};