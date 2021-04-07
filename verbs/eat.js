const gameengine = require('../gameengine');

let act = async function (state, details) {
    let eater = state.parties[state.activeParty].leader;
    if (details.nutrition)
        eater.nutrition = Math.min(details.nutrition + eater.nutrition, eater.maxNutrition);
    if (details.stamina)
        eater.stamina = Math.min(details.stamina + eater.stamina, eater.maxStamina);
    if (details.health)
        eater.health = Math.min(details.health + eater.health, eater.maxHealth);
   
    gameengine.displayText(state, details.text, details.pause || 100);
};


module.exports = {
	act: act
};