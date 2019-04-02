// Future note: GameEngine reference will be needed eventually. it needs to lazy load like location.js does, because of circular dependency.

let addControls = function (state, controls) {
	// TODO
}

let getStatusDisplay = function (state) {
    let healthText = `Health: ${50} / ${50}`;
    let staminaText = `Stamina: ${50} / ${50}`;
    let nutritionText = `Nutrition: ${50} / ${50}`;
	let statusDisplay = {
        lines: [{ "text": healthText, "help":"Health.\nWhen your health drops to zero, you will be force to rewind to your last rest point. Over time, nutrition converts to stamina and then to health." },
            { "text": staminaText, "help":"Stamina.\nWhen your stamina drops to zero, you will need to digest food to recover. Some actions spend stamina, and also it converts to health over time."},
            { "text": nutritionText, "help":"Nutrition.\nEat food to fill up so you can recover and heal."}]
	};
	
	return statusDisplay;
}

module.exports = {
	addControls: addControls,
	getStatusDisplay: getStatusDisplay
};