// Redscale's world time concepts:
// A while is a 60th of a day. I.e. 24 minutes equivalent.
// Thus a day is 60 whiles. Travelling one space takes a while.
// Resting fast-forwards 10 whiles, aka 4 hrs.

// Each month is 35 days, and there are 10 months per year. 350 total days.
// Each week is 7 days, each month 5 weeks.

let weeks = ["Emerging", "Growing", "Prime", "Aging", "Venerable"];
let days = ["Joy", "Focus", "Struggle", "Stride", "Triumph", "Hope", "Rest"];
let months = [
    {
        name: "Time",
        dawn: 12,
        dusk: 48
    }, {
        name: "Fire",
        dawn: 10,
        dusk: 50
    }, {
        name: "Light",
        dawn: 10,
        dusk: 50
    }, {
        name: "Energy",
        dawn: 12,
        dusk: 48
    }, {
        name: "Order",
        dawn: 15,
        dusk: 45
    }, {
        name: "Space",
        dawn: 18,
        dusk: 42
    }, {
        name: "Water",
        dawn: 20,
        dusk: 40
    }, {
        name: "Darkness",
        dawn: 20,
        dusk: 40
    }, {
        name: "Life",
        dawn: 18,
        dusk: 42
    }, {
        name: "Chaos",
        dawn: 15,
        dusk: 45
    }
]

let getTimeOfDay = function (state) {
    let timeOfDay = state.gameTime % 60;
    let monthOfYear = Math.floor(state.gameTime / 2100) % 10;
    if (timeOfDay == 0) {
        return "Midnight";
    } else if (timeOfDay < months[monthOfYear].dawn) {
        return "Predawn";
    } else if (timeOfDay == months[monthOfYear].dawn) {
        return "Dawn";
    } else if (timeOfDay < 12) {
        return "Morning";
    } else if (timeOfDay == 12) {
        return "Noon";
    } else if (timeOfDay < months[monthOfYear].dusk) {
        return "Afternoon";
    } else if (timeOfDay == months[monthOfYear].dusk) {
        return "Dusk";
    } else {
        return "Evening";
    } 
}

let getDayOfWeek = function (state) {
    let dayOfWeek = Math.floor(state.gameTime / 60) % 7;
    return days[dayOfWeek];
}

let getWeekOfMonth = function (state) {
    let weekOfMonth = Math.floor(state.gameTime / 420) % 5;
    return weeks[weekOfMonth];
}

let getMonthOfYear = function (state) {
    let monthOfYear = Math.floor(state.gameTime / 2100) % 10;
    return months[monthOfYear].name;
}

let getAgeInYears = function (state) {
    let ageInYears = Math.floor(state.gameTime / 21000) +20;
    return ageInYears;
}


let getTimeString = function (state) {
    return `${getTimeOfDay(state)} on the ${getWeekOfMonth(state)} ${getDayOfWeek(state)} of ${getMonthOfYear(state)}, ${1000 + getAgeInYears(state)}`;
};

let verifyTime = function (state, timing) {
    if (timing.time && timing.time != getTimeOfDay(state)) return false;
    if (timing.day && timing.day != getDayOfWeek(state)) return false;
    if (timing.week && timing.week != getWeekOfMonth(state)) return false;
    if (timing.month && timing.month != getMonthOfYear(state)) return false;
    if (timing.years && timing.years != getAgeInYears(state)) return false;

    return true;
}

module.exports = {
    getTimeString: getTimeString,
    verifyTime: verifyTime
};