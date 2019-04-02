var fs = require('fs');

var cache = {};
var watches = {};

let watch = function (path) {
    if (watches[path] === undefined) {
        watches[path] = fs.watch(path, {}, (eventType, filename) => {
            if (!cache[path] || !cache[path].isGameSaving) {
                if (cache[path])
                    console.log("Uncaching file: " + path);
                cache[path] = undefined;
            }
        });
    }
}

let load = function (path) {
    if (cache[path] === undefined) {
        console.log("Loading file: " + path);
        cache[path] = new Promise(function (resolve, reject) {

            fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                } else {
                    resolve(JSON.parse(data));
                    watch(path);
                }
            });
        });
    }
	return cache[path];
};

let save = function (path, value) {
	cache[path] = new Promise(function (resolve, reject) {
        fs.writeFile(path, JSON.stringify(value), { encoding: 'utf8' }, (err) => {
            if (err)
                console.log(err);
            else
                console.log("Saved " + path);
            cache[path].isGameSaving = false;
            watch(path);
            resolve(value);
        });
    });
    cache[path].isGameSaving = true;
}

let clear = function () { cache = {} };

module.exports = {
	clear: clear,
	load: load,
	save: save
};