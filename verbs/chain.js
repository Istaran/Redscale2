let gameengine = require('../gameengine');

let act = async function (state, details) {
    let chainedText = "";
    let condition = null;
 
    for (var i = 0; i < details.length; i++) {
        let element = details[i];
        if (element.verb) {
            if (await gameengine.conditionMet(state, condition)) {
                state.view.status = null;
                await gameengine.doVerb(element.verb, state, element.details);
                if (state.view.status) {
                    chainedText += (chainedText.length ? "\n\n" : "") + state.view.status;
                }
            }
            condition = null;
        } else if (element.condition) {
            condition = element;
        }
    }
    state.view.status = chainedText;
};


module.exports = {
	act: act
};