/*!
 * Most of YLib.Util code is based on leaflet.js
 */

YLib.Util = YLib.Utils = {
	extend: function (dest) { // (Object[, Object, ...]) ->
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},

	/*!
	* Based on merge-deep <https://github.com/jonschlinkert/merge-deep>
	* Copyright (c) 2014-2015, Jon Schlinkert. Licensed under the MIT License.
	*/
	extendDeep: function(orig /*, obj, ...*/) {

		function _merge(target, obj) {
			for (var key in obj) {
				if (!_hasOwn(obj, key)) continue;
				var objVal = obj[key], targetVal = target[key];

				if (YLib.Util.isObject(targetVal) && YLib.Util.isObject(objVal)) {
					target[key] = _merge(targetVal, objVal);
				} else if (YLib.Util.isArray(targetVal)) {
					target[key] = [].concat(objVal, targetVal);
				} else {
					target[key] = _clone(objVal);
				}
			}
			return target;
		}
		function _hasOwn(obj, key) {
			return Object.prototype.hasOwnProperty.call(obj, key);
		}
		function _clone(obj) {
			return obj;
		}

		if (!YLib.Util.isObject(orig) && !YLib.Util.isArray(orig)) orig = {};

		var target = YLib.Util.extend({}, orig);
		var len = arguments.length;
		var idx = 0;
		while (++idx < len) {
			var val = arguments[idx];
			if (YLib.Util.isObject(val) || YLib.Util.isArray(val))  _merge(target, val);
		}
		return target;

	},

	bind: function (fn, obj) { // (Function, Object) -> Function
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function () {
			return fn.apply(obj, args || arguments);
		};
	},

	stamp: (function () {
		var lastId = 0, key = '_leaflet_id';
		return function (/*Object*/ obj) {
			obj[key] = obj[key] || ++lastId;
			return obj[key];
		};
	}()),

	invokeEach: function (obj, method, context) {
		var i, args;

		if (typeof obj === 'object') {
			args = Array.prototype.slice.call(arguments, 3);

			for (i in obj) {
				method.apply(context, [i, obj[i]].concat(args));
			}
			return true;
		}

		return false;
	},

	limitExecByInterval: function (fn, time, context) {
		var lock, execOnUnlock;

		return function wrapperFn() {
			var args = arguments;

			if (lock) {
				execOnUnlock = true;
				return;
			}

			lock = true;

			setTimeout(function () {
				lock = false;

				if (execOnUnlock) {
					wrapperFn.apply(context, args);
					execOnUnlock = false;
				}
			}, time);

			fn.apply(context, args);
		};
	},

	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	trim: function (str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	splitWords: function (str) {
		return YLib.Util.trim(str).split(/\s+/);
	},

	setOptions: function (obj, options) {
		obj.options = YLib.extend({}, obj.options, options);
		return obj.options;
	},

	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	},

	isArray: function (item) {
		return (Object.prototype.toString.call(item) === '[object Array]');
	},

	isObject: function (item) {
		return (item && typeof item === 'object' && !Array.isArray(item));
	},

	htmlSpecialChars : function(str) {
		if (typeof(str) == "string") {
			str = str.replace(/&/g, "&amp;"); /* must do &amp; first */
			str = str.replace(/"/g, "&quot;");
			str = str.replace(/'/g, "&#039;");
			str = str.replace(/</g, "&lt;");
			str = str.replace(/>/g, "&gt;");
		}
		return str;
	},

	formatBytes : function(bytes) {
		bytes = parseInt(bytes);
		if(bytes == 0) return '0 Byte';
		var k = 1000;
		var sizes = ['Bytes', 'KB', 'MB', 'GB'];
		var i = Math.floor(Math.log(bytes) / Math.log(k));
		return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
	},

    jsonParse : function(str) {
		if(!str) return false;
        return JSON.parse(str
            // wrap keys without quote with valid double quote
            .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":';})
            // replacing single quote wrapped ones to double quote
            .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"';})
        );
    },

	emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

YLib.extend = YLib.Util.extend;
YLib.bind = YLib.Util.bind;
YLib.stamp = YLib.Util.stamp;
YLib.setOptions = YLib.Util.setOptions;
