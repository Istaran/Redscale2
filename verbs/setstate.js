let gameengine = require('../gameengine');

let act = async function (state, details) {
    let value = details.value;
    if (details.dataname) value = state.data[details.dataname];
    if (details.statepath) value = gameengine.readContextPath(state, details.context, details.statepath);
    gameengine.writeContextPath(state, details.context, details.statename, value);

    state.view.status = details.text;
};


module.exports = {
	act: act
};