let cache = require('../cache');

let act = async function (state, details) {
    let leader = state.parties[state.activeParty].leader;
    let existingCount = leader[`${details.type}Cards`][details.card] || 0;
    if (existingCount >= 10)
        state.view.status = "You can't gain any more copies of " + details.card;
    else if (Math.random() * existingCount > 1) { // You have a 1 in X chance of getting the card, where X is the current copies. (First two guaranteed)
        state.view.status = details.fail;
    } else {
        leader[`${details.type}Cards`][details.card] = existingCount + 1;
        let cards = await cache.load(`data/combat/${details.type} cards.json`);
        let autoreplace = cards[details.card].autoreplace;
        if (autoreplace && leader[`${details.type}DefaultHand`][autoreplace]) {
            leader[`${details.type}DefaultHand`][autoreplace] = undefined;
            leader[`${details.type}DefaultHand`][details.card] = 1;
        }
        state.view.status = details.text;
    }
};


module.exports = {
	act: act
};