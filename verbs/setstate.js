let gameengine = require('../gameengine');

let act = async function (state, details) {
    let value = details.value || state.data[details.dataname];

    gameengine.writeContextPath(state, details.context, details.statename, value);

    state.view.status = details.text;
};


module.exports = {
	act: act
};