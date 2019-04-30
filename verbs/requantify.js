let gameengine = require('../gameengine');

let act = async function (state, details) {
    console.log(`Requantifying:State:${JSON.stringify(state)}\ndetails:${JSON.stringify(details)}`);

    gameengine.writeContextPath(state, details.leftDataContext, details.leftPath, state.data.left);
    gameengine.writeContextPath(state, details.rightDataContext, details.rightPath, state.data.right);

    await gameengine.doVerb(details.then.verb, state, details.then.details);

};


module.exports = {
	act: act
};