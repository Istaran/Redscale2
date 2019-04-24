let time = require('./time');

let satisfied = function (state, details) {
    let match = time.verifyTime(state, details);
    console.log(`${time.getTimeString(state)} did ${match ? '' : 'not '}match ${JSON.stringify(details)}`);
    return false;
};

module.exports = {
       satisfied: satisfied
}