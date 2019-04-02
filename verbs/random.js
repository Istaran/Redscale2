let act = async function(state, details) {
    state.view.status = details.text;
};


module.exports = {
	act: act
};