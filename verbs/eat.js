let act = async function (state, details) {
    let eater = state.parties[state.activeParty].leader;
    eater.nutrition = Math.min(details.nutrition + eater.nutrition, eater.maxNutrition);

    state.view.status = details.text;
};


module.exports = {
	act: act
};