let cache = require('../cache');

let act = async function (state, details) {
    let leader = state.parties[state.activeParty].leader;
    if (!leader[`${details.type}Sideboard`]) leader[`${details.type}Sideboard`] = {};
    let existingCount = (leader[`${details.type}Cards`][details.card] || 0) + (leader[`${details.type}Sideboard`][details.card] || 0);
    if (existingCount >= 10)
        state.view.status = "You can't gain any more copies of " + details.card;
    else if (Math.random() * existingCount > 1) { // You have a 1 in X chance of getting the card, where X is the current copies. (First two guaranteed)
        state.view.status = details.fail;
    } else {
        if (leader[`${details.type}Sideboard`][details.card])
            leader[`${details.type}Sideboard`][details.card]++;
        else
            leader[`${details.type}Cards`][details.card] = (leader[`${details.type}Cards`][details.card] || 0) + 1;
        let cards = await cache.load(`data/combat/${details.type} cards.json`);
        let autoreplace = cards[details.card].autoreplace;
        let replaced = "";
        if (autoreplace && leader[`${details.type}DefaultHand`][autoreplace] && !leader[`${details.type}DefaultHand`][details.card]) {
            leader[`${details.type}DefaultHand`][autoreplace] = undefined;
            leader[`${details.type}DefaultHand`][details.card] = 1;
            replaced = `\nYou replaced ${autoreplace} with it in your starting hand.`;
        }
        state.view.status = `${details.text}\n\nYou now have ${existingCount + 1} copy of ${details.card}${replaced}`;
    }
};


module.exports = {
	act: act
};