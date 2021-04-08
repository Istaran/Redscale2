const gameengine = require('../gameengine');

let act = async function (state, details) {
    if (state.enemy) {
        state.enemy.phasequeue = details.queue.slice();        
        gameengine.displayText(state, details.text, details.pause || 100);
    }
}

module.exports = {
    act: act
};