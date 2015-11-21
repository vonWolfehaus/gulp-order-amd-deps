(function() {
	var _map = {};
	var _i = {};

	function get(key) {
		if (_i.hasOwnProperty(key)) return _i[key];
		if (_map.hasOwnProperty(key)) return _map[key];
		throw new Error('Cannot find module "'+key+'"');
	}

	function set(key, module) {
		if (_map.hasOwnProperty(key)) return;
		if (typeof(module) === 'function') {
			_map[key] = module();
		}
		else {
			_map[key] = module;
		}
	}

	window.define = set;
	window.define.amd = false;
	window.require = get;
}());
