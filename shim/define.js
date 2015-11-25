(function() {
	var _map = {};

	function get(key) {
		if (_map.hasOwnProperty(key)) return _map[key];
		throw '[require-shim] Cannot find module "'+key+'"';
	}

	function set(key, module) {
		if (_map.hasOwnProperty(key)) {
			throw '[define-shim] Module ' + key + ' already exists';
			return;
		}
		
		if (typeof module === 'function') {
			_map[key] = module(get);
		}
		else {
			_map[key] = module;
		}
	}

	window.define = set;
	window.define.amd = false;
	window.require = get;
}());
