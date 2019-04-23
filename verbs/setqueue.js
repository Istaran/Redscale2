let act = async function (state, details) {
    if (state.enemy) {
        state.enemy.phasequeue = details.queue.slice();
        state.view.status = details.text;
    }
}


module.exports = {
    act: act
};