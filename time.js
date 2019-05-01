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
        dusk: 48,
        sunrate: 0.9
    }, {
        name: "Fire",
        dawn: 10,
        dusk: 50,
        sunrate: 1
    }, {
        name: "Light",
        dawn: 10,
        dusk: 50,
        sunrate: 1,
    }, {
        name: "Energy",
        dawn: 12,
        dusk: 48,
        sunrate: 0.9
    }, {
        name: "Order",
        dawn: 15,
        dusk: 45,
        sunrate: 0.75
    }, {
        name: "Space",
        dawn: 18,
        dusk: 42,
        sunrate: 0.6
    }, {
        name: "Water",
        dawn: 20,
        dusk: 40,
        sunrate: 0.5
    }, {
        name: "Darkness",
        dawn: 20,
        dusk: 40,
        sunrate: 0.5
    }, {
        name: "Life",
        dawn: 18,
        dusk: 42,
        sunrate: 0.6
    }, {
        name: "Chaos",
        dawn: 15,
        dusk: 45,
        sunrate: 0.75
    }
]

// Sun Factor is 10% at night, up to max of 50%-100% at noon based on time of year.
// This is all multiplied by a location factor, i.e. 0 underground. 1 for sky or otherwise unshaded area.
getSunFactor = function (state) {
    let timeOfDay = state.gameTime % 60;
    let monthOfYear = Math.floor(state.gameTime / 2100) % 10;
    let baseSun = months[monthOfYear].sunrate;
    if (timeOfDay == 0) {
        return 0.1;
    } else if (timeOfDay < months[monthOfYear].dawn) {
        return 0.1;
    } else if (timeOfDay == months[monthOfYear].dawn) {
        return 0.2 * baseSun;
    } else if (timeOfDay < 30) {
        return ((timeOfDay - months[monthOfYear].dawn) / (30 - months[monthOfYear].dawn) * 0.8 + 0.2) * baseSun ;
    } else if (timeOfDay == 30) {
        return baseSun;
    } else if (timeOfDay < months[monthOfYear].dusk) {
        return ((months[monthOfYear].dusk - timeOfDay) / (months[monthOfYear].dusk - 30) * 0.8 + 0.2) * baseSun;
    } else if (timeOfDay == months[monthOfYear].dusk) {
        return 0.2 * baseSun;
    } else {
        return 0.1;
    } 
}

let getTimeOfDay = function (state) {
    let timeOfDay = state.gameTime % 60;
    let monthOfYear = Math.floor(state.gameTime / 2100) % 10;
    if (timeOfDay == 0) {
        return "Midnight";
    } else if (timeOfDay < months[monthOfYear].dawn) {
        return "Predawn";
    } else if (timeOfDay == months[monthOfYear].dawn) {
        return "Dawn";
    } else if (timeOfDay < 30) {
        return "Morning";
    } else if (timeOfDay == 30) {
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
    if (timing.time) {
        let time = getTimeOfDay(state);
        console.log(`${timing.time} == ${time}? ${timing.time != time}`);
        if (timing.time != time) return false;
    }
    if (timing.day) {
        let day = getDayOfWeek(state);
        console.log(`${timing.day} == ${day}? ${timing.day != day}`);
        if (timing.day != day) return false;
    }
    if (timing.week) {
        let week = getWeekOfMonth(state);
        console.log(`${timing.week} == ${week}? ${timing.week != week}`);
        if (timing.week != week) return false;
    }
    if (timing.month) {
        let month = getMonthOfYear(state);
        console.log(`${timing.month} == ${month}? ${timing.month != month}`);
        if (timing.month != month) return false;
    }
    if (timing.years) {
        let age = getAgeInYears(state);
        console.log(`${timing.years} == ${age}? ${timing.years != age}`);
        if (timing.years != age) return false;
    }

    return true;
}

module.exports = {
    getTimeString: getTimeString,
    verifyTime: verifyTime
};