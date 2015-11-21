# [gulp](http://gulpjs.com)-sort-amd

> Sorts files in stream by dependencies using @requires annotation. Used in conjuction with [gulp-concat](https://github.com/wearefractal/gulp-concat) to concat files in correct order to have dependent files below the theirs dependencies.

The point of this plugin is to create bundles of scripts that use the AMD/requirejs definition format by sorting all dependencies into the correct execution order, thereby allowing you to use your modules without adding the weight of requirejs to your website. Instead, you can use a stupid simple define/require shim (found in `/dist`).

The greatest benefit of this is the ability to require modules from outside the bundle itself, thereby allowing you to split bundles up per page (or even within a single page app) and still allow modules across bundles to communicate with each other without requirejs.

This assumes you are concatenating all of your scripts into various bundles, as this method prevents dynamic loading of individual modules (which I saw as a plus since it's best to bundle anyway). But because you can access modules in one bundle from another, you can dynamically load that bundle with a single, simple XHR call. This is ideal for single page apps that have large sections of content that you only want to load if the user accesses them, which is exactly the use case I built this for.

## Install

```bash
$ npm install --save-dev gulp-sort-amd
```

## Usage

### Gulpfile

```js
var gulp = require('gulp');
var depsOrder = require('gulp-deps-order');
var concat = require('gulp-concat');

gulp.task('default', function () {
	return gulp.src('src/**/*.js')
		.pipe(depsOrder())
        .pipe(concat('build.js'))
		.pipe(gulp.dest('dist'));
});
```

### Source file

Names modules with dependencies as a parameter:
```js
define('a', ['b', 'c'], function(b, c) {
	// hot sauce
});
```

Unnamed modules in the commonJS style:
```js
define(function() {
	var b = require('b');
	var c = require('c');
});
```

And everything else [amdetective](https://github.com/mixu/amdetective) supports.

## License

gulp-sort-amd is MIT licensed. Feel free to use it, contribute or spread the word. Created by [Corey Birnbaum](https://twitter.com/vonWolfehaus). Based off of gulp-deps-order by Petr Nevyhoštěný ([Twitter](https://twitter.com/pnevyk)).
