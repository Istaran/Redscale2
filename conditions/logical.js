let gameengine = require('../gameengine');

let satisfied = function (state, details) {
    let maxPass = 0;
    let maxFail = 0;
    let total = details.conditions.length;
    switch (details.rule) {
        case "not":
            maxFail = 1;
            break;
        case "and":
            maxPass = total;
            break;
        case "or":
            maxPass = total;
            maxFail = total - 1;
            break;
        case "nor":
            maxFail = total;
            break;
        case "nand":
            maxPass = total - 1;
            maxFail = total;
            break;
        default:
            console.log("Forgot a rule for logic. Assuming fail. Details:\n" + JSON.stringify(details));
            return false;
    }
    for (var i = 0; i < total; i++) {
        let subSatisfied = gameengine.conditionMet(state, details.conditions[i]);
        if (subSatisfied) {
            maxPass--;
            if (maxPass < 0) return false; // Too many things passed for the condition.
        } else {
            maxFail--;
            if (maxFail < 0) return false; // Too many things failed for the condition.
        }
    }
    return true; // We are in the logical range.
};

module.exports = {
    satisfied: satisfied
}