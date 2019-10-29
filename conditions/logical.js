let gameengine = require('../gameengine');

let satisfied = async function (state, details) {
    let maxPass = 0;
    let pass = 0;
    let maxFail = 0;
    let fail = 0;
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
        let subSatisfied = await gameengine.conditionMet(state, details.conditions[i]);
        if (subSatisfied) {
            pass++;
            if (maxPass < pass) {
                console.log(`${details.rule} passed too many subconditions. Result: false`);
                return false; // Too many things passed for the condition.
            }
        } else {
            fail++;
            if (maxFail < fail) {
                console.log(`${details.rule} failed too many subconditions. Result: false`);
                return false; // Too many things failed for the condition.
            }
        }
    }
    console.log(`${details.rule} passed ${pass} <= ${maxPass} and failed ${fail} <= ${maxFail}. Result: true`);
    return true; // We are in the logical range.
};

module.exports = {
    satisfied: satisfied
}