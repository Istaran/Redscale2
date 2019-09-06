let satisfied = function (state, details) {
    var count = state.parties[state.activeParty].inventory[details.item] || 0;
    console.log(`Checking inventory for ${details.item}. Found ${count}, needed ${details.count || 1}`);
    return count >= (details.count || 1); 
};

module.exports = {
    satisfied: satisfied
}