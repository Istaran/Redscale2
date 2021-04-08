let gameengine = require('../gameengine');

let act = async function (state, details) {
    let chainedText = "";
    let condition = null;
 
    for (var i = 0; i < details.length; i++) {
        let element = details[i];
        if (element.verb) {
            if (await gameengine.conditionMet(state, condition)) {
                await gameengine.doVerb(element.verb, state, element.details);
            }
            condition = null;
        } else if (element.condition) {
            condition = element;
        }
    }
};


module.exports = {
	act: act
};