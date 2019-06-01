
let cache = require('../cache');
let combatengine = require('../combatengine');
let gameengine = require('../gameengine');

let act = async function (state, details) {
    let party = state.parties[state.activeParty];
    let targets = [];
    let targetType = [];
    switch (details.target) {
        case "random one":
            // Arrange 25% chance of follower hit (scaled down if less than 3 followers), 50% chance of pawn hit (scaled down if less than 8 pawns), rest is leader hit.
            let plus = Math.max(0, (3 - Math.min(3, party.followers.length)) / 12);
            let minus = Math.max(0, (8 - Math.min(8, party.pawns.length)) / 16);
            let rand = Math.random() * (1 - plus - minus) + plus;

            if (rand < 0.25) {
                targetType.push("follower");
                targets.push(party.followers[Math.floor(Math.random() * party.followers.length)]);
            }
            else if (rand > 0.5) {
                targetType.push("pawn");
                targets.push(party.pawns[Math.floor(Math.random() * party.pawns.length)]);
            }
            else {
                targetType.push("leader");
                targets.push(party.leader);
            }
            break;
    }
    var resultText = "";
    for (var i = 0; i < targets.length; i++) {
        let target = targets[i];
        let defs = null;
        switch (targetType[i]) {
            case "pawn":
                defs = await cache.load(`data/pawns/${target.name}.json`);
                break;
        }

        switch (details.effect) {
            case "damage":
                let immune = false;
                for (var t = 0; t < details.immunitytags.length; t++) {
                    if (target.tags[details.immunitytags[i]]) {
                        immune = true;
                        resultText += await gameengine.scrubText(state,
                            details[`${targetType[i]}immunetext`][details.immunitytags[t]],
                            target.tags,
                            defs ? defs.scrubbers : null);
                        break;
                    }
                }
                if (!immune) {
                    let attackRoll = await combatengine.attackRoll(details.accuracy, target.evasion || defs.evasion);
                    if (attackRoll == 0) {
                        resultText += await gameengine.scrubText(state,
                            details[`${targetType[i]}misstext`],
                            target.tags,
                            defs ? defs.scrubbers : null);
                    } else {
                        let damage = (await combatengine.damageRoll(details.damagedice, details.damagedie, details.damageplus)) * attackRoll;
                        if (!target.health) target.health = defs.maxHealth;
                        target.health -= damage;
                        if (target.health > 0) {
                            resultText += await gameengine.scrubText(state,
                                details[`${targetType[i]}hittext`] + `${targetType[i] == "leader" ? "You" : "{They}"} received ${damage} ${details.damagetype} damage.\n`,
                                target.tags,
                                defs ? defs.scrubbers : null);
                        } else {
                            resultText += await gameengine.scrubText(state,
                                details[`${targetType[i]}killtext`],
                                target.tags,
                                defs ? defs.scrubbers : null);
                        }
                    }
                }
                break;
        }
    }

    state.view.status = resultText;
};


module.exports = {
	act: act
};
