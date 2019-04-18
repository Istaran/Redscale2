let gameengine = require('../gameengine');

let act = async function (state, details) {
    let choice = await gameengine.randomChoice(state, details);
    if (choice) {
        await gameengine.doVerb(choice.verb, state, choice.details);
    }
    else {
        console.log(`Random failed to find a suitable option. ${JSON.stringify(details)}`);
    }
};


module.exports = {
    act: act
};