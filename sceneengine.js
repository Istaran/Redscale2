var cache = require('./cache');
var gameengine = null;

let getControls = async function (state, scene) {
    if (!gameengine) gameengine = require('./gameengine');

    let sceneDef = await cache.load(`data/scenes/${scene.name}.json`);
    let subscene = sceneDef[scene.sub];
    let controls = [];
    for (var i = 0; i < subscene.controls.length; i++) {
        controls.push([]);
        for (var j = 0; j < subscene.controls[i].length; j++) {
            let ctrl = await gameengine.getControl(state, subscene.controls[i][j]);
            if (ctrl)
                controls[i].push(ctrl);
        }
    }
    return controls;
}

module.exports = {
    getControls: getControls
};