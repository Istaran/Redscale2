
var cache = require('../cache');
var gameengine = require('../gameengine');

let act = async function (state, details) {
    let target = await gameengine.randomChoice(state, details.targets);
    let targetDef = await cache.load(`data/enemies/${target.name}.json`);
    let enemy = {
        name: target.name,
        health: targetDef.health,
        cardsets: JSON.parse(JSON.stringify(targetDef.cardsets)),
        phasequeue: ["aggress","abjure","assess","assist"]
    };
    state.enemy = enemy;
    state.view.status = targetDef["hunt announce"];
};


module.exports = {
	act: act
};