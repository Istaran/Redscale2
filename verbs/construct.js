let gameengine = require('../gameengine');

let act = async function (state, details) {
    let newBuild = {
        display: details.display,
        type: details.type,
        subtype: details.subtype,
        inventory: {},
        workers: [],
        lastUpdated: state.gameTime
    };
    gameengine.writeContextPath(state, "location", "building", newBuild);

    state.view.status = details.text;
};


module.exports = {
	act: act
};