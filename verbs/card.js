let act = async function (state, details) {
    let leader = state.parties[state.activeParty].leader;
    let existingCount = leader[`${details.type}Cards`][details.card] || 0;
    if (Math.random() * 10 < existingCount) {
        state.view.status = details.fail;
    } else {
        leader[`${details.type}Cards`][details.card] = existingCount + 1;
        state.view.status = details.text;
    }
};


module.exports = {
	act: act
};