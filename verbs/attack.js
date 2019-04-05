var combatengine = require('../combatengine');

let act = async function (state, details) {

    state.view.status = await combatengine.configureEnemy(state, details.enemy, "attack");
};


module.exports = {
    act: act
};