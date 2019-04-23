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

let getTimeString = function (state) {
    let timeOfDay = state.gameTime % 60;
    let dayOfWeek = ((state.gameTime - timeOfDay) / 60) % 7;
    let weekOfMonth = ((state.gameTime - timeOfDay - 60 * dayOfWeek) / 420) % 5;
    let monthOfYear = ((state.gameTime - timeOfDay - 60 * dayOfWeek - weekOfMonth * 420) / 2100) % 10;
    let ageInYears = ((state.gameTime - timeOfDay - 60 * dayOfWeek - weekOfMonth * 420 - monthOfYear * 2100) / 21000) + 20;

    let preface = "";
    if (timeOfDay == 0) {
        preface = "Midnight";
    } else if (timeOfDay < months[monthOfYear].dawn) {
        preface = "Predawn";
    } else if (timeOfDay == months[monthOfYear].dawn) {
        preface = "Dawn";
    } else if (timeOfDay < 12) {
        preface = "Morning";
    } else if (timeOfDay == 12) {
        preface = "Noon";
    } else if (timeOfDay < months[monthOfYear].dusk) {
        preface = "Afternoon";
    } else if (timeOfDay == months[monthOfYear].dusk) {
        preface = "Dusk";
    } else {
        preface = "Evening";
    }
    
    return `${preface} on the ${weeks[weekOfMonth]} ${days[dayOfWeek]} of ${months[monthOfYear].name}, ${1000 + ageInYears}`;
};

module.exports = {
    getTimeString: getTimeString
};