let gameengine = require('../gameengine');

let act = async function (state, details) {
    console.log(`Requantifying:State:${JSON.stringify(state)}\ndetails:${JSON.stringify(details)}`);

    let leftContext = gameengine.getContext(state, details.leftDataContext);
    if (!leftContext[details.dataset]) leftContext[details.dataset] = {};
    leftContext[details.dataset] = Object.assign({}, state.data.left);
    let rightContext = gameengine.getContext(state, details.rightDataContext);
    if (!rightContext[details.dataset]) rightContext[details.dataset] = {};
    rightContext[details.dataset] = Object.assign({}, state.data.right);

    await gameengine.doVerb(details.then.verb, state, details.then.details);

};


module.exports = {
	act: act
};