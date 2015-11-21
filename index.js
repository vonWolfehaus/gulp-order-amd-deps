'use strict';
var PluginError = require('gulp-util').PluginError;
var through = require('through2');
var toposort = require('toposort');
var amdetective = require('amdetective');
var path = require('path');

module.exports = function () {
	var graph = [],
		files = {},
		ext = null,
		hasDep;

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new PluginError('gulp-deps-order', 'Streaming not supported'));
			return cb();
		}

		hasDep = false;
		ext = '.' + file.path.substring(file.path.lastIndexOf('.') + 1);

		var detect = amdetective(file.contents.toString());
		// anonymous modules will have amdetective return an array of strings
		// if named, then it returns an array of {name:String, deps:String[]}
		var amdDeps = typeof(detect[0]) === 'string' ? detect : detect[0].deps;

		amdDeps.map(function (dep) {
			if (typeof(dep) !== 'string') dep = dep.name;
			dep += ext; // attach the file extension otherwise the graph's keys won't match, throwing toposort way off
			return path.join(path.dirname(file.path), dep);
		}).forEach(function (dep) {
			hasDep = true;
			graph.push([file.path, dep]);
		});

		if (!hasDep) graph.push([file.path]);

		files[file.path] = file;

		cb();
	}, function (cb) {
		var ordered;

		try {
			ordered = toposort(graph).reverse();
		}
		catch (e) {
			this.emit('error', new PluginError('gulp-deps-order', e.toString()));
			return cb();
		}

		// search and ignore empty strings that were put there by files with no deps
		for (var i = 0; i < ordered.length; i++) {
			if (!files[ordered[i]]) continue;

			this.push(files[ordered[i]]);
		}

		cb();
	});
};