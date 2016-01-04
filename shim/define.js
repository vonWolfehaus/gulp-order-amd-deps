(function() {
	var _map = {};

	// only to be used if a global was not in the parameters of the define call
	function get(key) {
		if (_map.hasOwnProperty(key)) return _map[key];
		throw '[require-shim] Cannot find module "'+key+'"';
	}

	// global is an optional object and will attach the constructed module to it if present
	function set(key, module, global) {
		var m = null;
		var isGlobal = global && typeof global !== 'undefined';

		// check to make sure the module has been assigned only once
		if (isGlobal) {
			if (global.hasOwnProperty(key)) {
				throw '[define-shim] Module ' + key + ' already exists';
			}
		}
		else if (_map.hasOwnProperty(key)) {
			throw '[define-shim] Module ' + key + ' already exists';
			return;
		}

		// construct the module if needed
		if (typeof module === 'function') m = module(get);
		else m = module;

		// assign the module to whichever object is preferred
		if (isGlobal) global[key] = m;
		else _map[key] = m;
	}

	window.define = set;
	window.define.amd = false;
	window.require = get;
}());
