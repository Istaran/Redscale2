let gameengine = require('../gameengine');

let act = async function (state, details) {
    state.view.status = null;

    for (var i = 0; i < details.length; i++) {
        let element = details[i];
        if (await gameengine.conditionMet(state, element.if)) {
            await gameengine.doVerb(element.verb, state, element.details);
            break;
        }
    }
    if (state.view.status == null) {
        console.log(`Try to do first thing, but none were valid.\n${details}`);
    }
};


module.exports = {
    act: act
};