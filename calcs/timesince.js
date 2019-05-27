let gameengine = require('../gameengine');

let value = function (state, details) {
    let val = gameengine.readContextPath(state, details.context, details.fact);
    let since = val ? state.gameTime - val : 0;
    console.log(`Time since ${details.context}:${details.fact} is ${since}`);
    return val;
};

module.exports = {
    value: value
}