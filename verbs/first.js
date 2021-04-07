let gameengine = require('../gameengine');

let act = async function (state, details) {
    for (var i = 0; i < details.length; i++) {
        let element = details[i];
        if (await gameengine.conditionMet(state, element.if)) {
            await gameengine.doVerb(element.verb, state, element.details);
            break;
        }
    }
    if (i == details.length) {
        console.log(`Try to do first thing, but none were valid.\n${details}`);
    }
};


module.exports = {
    act: act
};