var cache = require('./cache');
var gameengine = null;

let getControls = async function (state, scene) {
    if (!gameengine) gameengine = require('./gameengine');
    let private = state.query.nsfw == 'true' && await cache.load(`./private/scenes/${scene.name}.json`);
    let sceneDef = await cache.load(`data/scenes/${scene.name}.json`);
    let subscene = (private && private[scene.sub]) || sceneDef[scene.sub];
    let controls = [];
    if (subscene) {
        for (var i = 0; i < subscene.controls.length; i++) {
            controls.push([]);
            for (var j = 0; j < subscene.controls[i].length; j++) {
                if (subscene.controls[i][j] && await gameengine.conditionMet(state, subscene.controls[i][j].if)) {
                    let ctrl = await gameengine.getControl(state, subscene.controls[i][j]);
                    if (ctrl)
                        controls[i].push(ctrl);
                }
            }
        }
    } else {
        controls.push([{
            "type": "actButton",
            "display": "Nevermind.",
            "verb": "setscene",
            "details": {
                "text": "Whatever you were up to, you're not feeling it now.",
                "clear": true
            }
        }]);
    }
    return controls;
}

module.exports = {
    getControls: getControls
};