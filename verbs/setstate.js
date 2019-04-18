let act = async function (state, details) {
    let value = details.value || state.data[details.dataname];
    let statePath = details.statename.split('/');
    let subState = state;
    switch (details.context) {
        case "party":
            subState = state.parties[state.activeParty];
    }
    let parent = undefined;
    let subPath = undefined;
    for (var i = 0; i < statePath.length; i++) {
        subPath = Array.isArray(subState) ? Number(statePath[i]) : statePath[i];
        if (!subState[subPath]) {
            subState[subPath] = {};
        }
        parent = subState;
        subState = subState[subPath];
    }
    console.log(`Setting ${details.statename} from ${parent[subPath]} to ${value}`);
    parent[subPath] = value;

    state.view.status = details.text;
};


module.exports = {
	act: act
};