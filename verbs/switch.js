const gameengine = require('../gameengine');

let act = async function (state, details) {
    let value = details.value;
    if (details.dataname) value = state.data[details.dataname];
    if (details.statepath) value = gameengine.readContextPath(state, details.sourcecontext, details.statepath);
    if (details.calc) value = await gameengine.calculate(state, details.calc);

    let choice = details.fork.default;
    if (details.fork[value]) {
        console.log(`Switching to ${value}`);
        choice = details.fork[value];
    } else {
        console.log(`Switch defaulted because it didn't find ${value}`);
    }
    if (choice) {
        await gameengine.doVerb(choice.verb, state, choice.details);
    }
    else {
        console.log(`Switch failed to find a suitable option. ${JSON.stringify(details)}`);
    }
};


module.exports = {
    act: act
};