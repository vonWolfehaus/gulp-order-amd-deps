'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');

var depsOrder = require('./index');

it('should sort files by dependencies defined using AMD', function (cb) {
	var stream = depsOrder();

	/*
	 *   === DEPS ===
	 *
	 *         e.js        f.js
	 *        /    \
	 *    b.js    d.js
	 *    |    \   |
	 *    |     c.js
	 *    \    /
	 *     a.js
	 *
	 */

	var depsGraph = {
		'a' : ['b', 'c'],
		'b' : ['e'],
		'c' : ['b', 'd'],
		'd' : ['e'],
		'e' : [],
		'f' : []
	};

	var files = [];

	var inputA = ['define("a", function() {',
			'    var c = require("c");',
			'    var b = require("b");',
			'});'
		].join('\n');

	var inputB = ['define(["e"], function(e) {',
			'',
			'});'
		].join('\n');

	var inputC = ['define(["d", "b"], function(d, b) {',
			'',
			'});'
		].join('\n');

	var inputD = ['define(function() {',
			'    var e = require("./e");',
			'});'
		].join('\n');

	var inputE = ['define("e", function() {',
			'',
			'});'
		].join('\n');

	var inputF = ['define({',
			'',
			'});'
		].join('\n');

	stream.on('data', function (file) {
		// console.log(file.relative)
		assert(depsGraph[file.relative]);

		depsGraph[file.relative].forEach(function (dep) {
			console.log(dep+' indexOf '+files.indexOf(dep))
			assert(files.indexOf(dep) !== -1);
		})

		files.push(file.relative);
	});

	stream.on('end', function () {
		console.log('LENGTH: '+files.length)
		assert.equal(files.length, 6);
		cb();
	});

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'a.js'),
		contents: new Buffer(inputA)
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'b.js'),
		contents: new Buffer(inputB)
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'c.js'),
		contents: new Buffer(inputC)
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'd.js'),
		contents: new Buffer(inputD)
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'e.js'),
		contents: new Buffer(inputE)
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'f.js'),
		contents: new Buffer(inputF)
	}));

	stream.end();
});

return;

it('should emit an error if there is a cyclic dependency', function (cb) {
	var stream = depsOrder();

	/*
	 *   === DEPS ===
	 *
	 *    a.js <-- b.js
	 *     |        ^
	 *     v        |
	 *    d.js --> c.js
	 *
	 */

	stream.on('error', function (err) {
		assert.notEqual(err, undefined);
		cb();
	});

	stream.on('data', function () {
		throw 'Cyclic dependency must emit an error';
		cb();
	});

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'a.js'),
		contents: new Buffer('/* @requires d.js\n */')
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'b.js'),
		contents: new Buffer('/* @requires a.js\n */')
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'c.js'),
		contents: new Buffer('/* @requires b.js\n */')
	}));

	stream.write(new gutil.File({
		base: __dirname,
		path: path.join(__dirname, 'd.js'),
		contents: new Buffer('/* @requires c.js\n */')
	}));

	stream.end();
});