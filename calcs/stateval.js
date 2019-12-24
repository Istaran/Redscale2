let gameengine = require('../gameengine');

let value = function (state, details) {
    let val = gameengine.readContextPath(state, details.context, details.fact);
    if (val === undefined) val = details.default;
    console.log(`${details.context}:${details.fact} is ${val}`);
    return val;
};

module.exports = {
    value: value
}