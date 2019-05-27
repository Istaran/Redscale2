let gameengine = require('../gameengine');

let satisfied = async function (state, details) {
    let subState = gameengine.readContextPath(state, details.context, details.fact);
    if (subState === undefined) return (details.rule == "!=" || details.rule == "<>");
    let value = await gameengine.calculate(state, details.value);
    console.log(subState + details.rule + details.value);
    switch (details.rule) {
        case "=":
        case "==":
            return (subState == value);
        case "!=":
        case "<>":
            return (subState != value);
        case "<":
            return (subState < value);
        case ">":
            return (subState > value);
        case "<=":
            return (subState <= value);
        case ">=":
            return (subState >= value);
    }
    console.log("Forgot to set a rule. Assuming false. Details:\n" + JSON.stringify(details));
    return false;
};

module.exports = {
       satisfied: satisfied
}