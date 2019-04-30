let gameengine = require('../gameengine');

let satisfied = function (state, details) {
    let subState = gameengine.readContextPath(state, details.context, details.fact);
    if (subState === undefined) return (details.rule == "!=" || details.rule == "<>");
    console.log(subState + details.rule + details.value);
    switch (details.rule) {
        case "=":
        case "==":
            return (subState == details.value);
        case "!=":
        case "<>":
            return (subState != details.value);
        case "<":
            return (subState < details.value);
        case ">":
            return (subState > details.value);
        case "<=":
            return (subState <= details.value);
        case ">=":
            return (subState >= details.value);
    }
    console.log("Forgot to set a rule. Assuming false. Details:\n" + JSON.stringify(details));
    return false;
};

module.exports = {
       satisfied: satisfied
}