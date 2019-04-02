
let satisfied = function (state, details) {
    let factPath = details.fact.split('/');
    let subState = state;
    for (var i = 0; i < factPath.length - 1; i++) {
        if (!subState[factPath[i]]) return false; // Various forms of falsiness can derail us, but generally it's that part of the state object doesn't exist.
        subState = subState[factPath[i]];
    }
    subState = subState[factPath[i]]; // Final bit of mapping.
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
    }
    console.log("Forgot to set a rule. Assuming false. Details:\n" + JSON.stringify(details));
    return false;
};

module.exports = {
       satisfied: satisfied
}