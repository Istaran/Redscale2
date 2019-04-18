let gameengine = require('../gameengine');

let act = async function (state, details) {
    let condition = null;
    state.view.status = null;

    for (var i = 0; i < details.length; i++) {
        let element = details[i];
        if (element.verb) {
            if (await gameengine.conditionMet(state, condition)) {

                await gameengine.doVerb(element.verb, state, element.details);
                break;
            }
            condition = null;
        } else if (element.condition) {
            condition = element;
        }
    }
    if (state.view.status == null) {
        console.log(`Try to do first thing, but none were valid.\n${details}`);
    }
};


module.exports = {
    act: act
};