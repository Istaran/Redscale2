let act = async function (state, details) {
    if (details.secondary) // Secondary scene overrides both current scene and enemy, while keeping track of both.
        state.scene2 = details.clear ? undefined : { type: details.type, name: details.name, sub: details.sub };
     else
        state.scene = details.clear ? undefined : { type: details.type, name: details.name, sub: details.sub };
    state.view.status = details.text;
};


module.exports = {
	act: act
};