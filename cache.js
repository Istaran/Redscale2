var fs = require('fs');

var cache = {};

let load = function (path) {
	if (cache[path] === undefined) {
		cache[path] = new Promise(function(resolve, reject) {
			
			fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
				if (err) {
					console.log(err);
					resolve(null);
				} else {
					resolve(JSON.parse(data));
				}
			});
		});
	}
	return cache[path];
};

let save = function (path, value) {
	let old = cache[path];
	
	cache[path] = new Promise(function (resolve, reject) {
		let writeValue = function () { fs.writeFile(path, JSON.stringify(value), {encoding: 'utf8'}, (err) => {if (err) console.log(err); resolve(value); });};
		if (old) {
			old.then(writeValue);
		} else {
			writeValue();
		}					
	});
}

let clear = function () { cache = {} };

module.exports = {
	clear: clear,
	load: load,
	save: save
};