let gameengine = require('../gameengine');

let value = function (state, details) {
    if (details.op == "?:") {
        if (await gameengine.conditionMet(state, details.operands[0]))
            return await gameengine.calculate(state, details.operands[1]);
        return await gameengine.calculate(state, details.operands[2]);
    }
    let logstring = "";
    let operands = [];
    let i = 0, v = 0;
    for (; i < details.operands.length; i++) {
        logstring = logstring ? `${logstring} ${details.op} ` : "";
        operands.push(await gameengine.calculate(state, details.operands[i]));
        logstring += operands[i];
    }
    
    switch (details.op) {
        case "+":
            for (i = 0; i < operands.length; i++) {
                v += operands[i];
            }
            return v;
        case "-":
            v = operands[0];
            for (i = 1; i < operands.length; i++) {
                v -= operands[i];
            }
            return v;
        case "*":
            for (i = 0; i < operands.length; i++) {
                v *= operands[i];
            }
            return v;
        case "/":
            v = operands[0];
            for (i = 1; i < operands.length; i++) {
                v /= operands[i];
            }
            return v;
        case "log":
            v = 0; x = 1;
            while (x < operands[0]) { x *= operands[1]; v++; }
            break;
        case "min":
            v = operands[0];
            for (i = 1; i < operands.length; i++) {
                v = (v > operands[i] ? operands[i] : v);
            }
            break;
        case "max":
            v = operands[0];
            for (i = 1; i < operands.length; i++) {
                v = (v < operands[i] ? operands[i] : v);
            }
            break;

        default:
            console.log("Forgot an operation for math. Assuming zero. Details:\n" + JSON.stringify(details));
            v = 0;
    }
    console.log(`${logstring} = ${v}`);
    return v;    
};

module.exports = {
    value: value
}