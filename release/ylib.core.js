/*! 
  * @package    ylib
 * @version    1.0.5
 * @date       2017-11-02
 * @author     Jannik Mewes
 * @copyright  Copyright (c) 2017 YOOlabs GmbH, Jannik Mewes
 */


(function(){
var YLib = {};
window.YLib = YLib;

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

	extendConcat: function (dest) { // (Object[, Object, ...]) -> // like extend, but concat arrays
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					if(YLib.Util.isArray(dest[i]) && YLib.Util.isArray(src[i])) dest[i] = dest[i].concat(src[i]);
					else dest[i] = src[i];
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

/*!
 * inheritable YLib.Class based on leaflet.js' base class. Custom prototype.
 */

YLib.Class = function () {};
YLib.Class.prototype.settings = {};
YLib.Class.prototype.DEBUG = false;
YLib.Class.prototype.initialize = function () {

};
// YLib.Class.prototype.showError = function(msg){
// 	$err = jQuery('<div class="msg alert alert-error"></div>');
//
// 	 msg = YLib.Util.sprintf('Error: %s', msg);
//
// 	if(typeof self.$messageFrame == 'undefined') self.$messageFrame = jQuery('#system-message-container');
// 	$err.html(msg);
// 	$err.insertBefore(self.$messageFrame);
// 	console.error(msg);
// };
//
// YLib.Class.prototype.showMessage = function(msg){
// 	$msg = jQuery('<div class="msg alert alert-notification"></div>');
//
// 	if(typeof self.$messageFrame == 'undefined') self.$messageFrame = jQuery('#system-message-container');
// 	$msg.html(msg);
// 	$msg.insertBefore(self.$messageFrame);
// };

YLib.Class.extend = function (props) {

	// extended class with the new prototype
    var NewClass = new Function("return function " + (props.className?props.className:'YLibClass') + "() {\n"
		+ "if (typeof this.defineProps == 'function') this.defineProps(); "
		+ "if (typeof this.initialize == 'function') this.initialize.apply(this, arguments); "
		+ "if (this._initHooks) this.callInitHooks.apply(this, arguments); "
		+ "}");
    NewClass = NewClass();

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;
	var proto = new F();
	proto.constructor = NewClass;
	proto._initHooks = proto._initHooks ? proto._initHooks.slice() : [];
	proto._includes = proto._includes ? proto._includes.slice() : [];
	// proto._mixins = proto._mixins || [];
	NewClass.prototype = proto;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		YLib.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		// props._mixins = [];
		for(var i=0; i<props.includes.length; i++) {
			if(typeof props.includes[i] == 'string' && typeof YLib.Mixin[props.includes[i]] != 'undefined') {
				// is a mixin
				// prevent duplicates
				if(proto._includes.indexOf(props.includes[i]) === -1) {
					proto._includes.push(props.includes[i]);
					// props._mixins.push(props.includes[i]);
					props.includes[i] = YLib.Mixin[props.includes[i]];
				}
			}
		}
		YLib.Util.extendConcat.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = YLib.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	YLib.Util.extendConcat(proto, props);


	var parent = this;
	var self = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype;

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) return;

		// if (parent.prototype.callInitHooks) {
		// 	parent.prototype.callInitHooks.apply(this,arguments);
		// }

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].apply(this,arguments);
		}
	};

	return NewClass;
};
YLib.Class.include = function (props) {
	if(typeof props == 'string' && typeof YLib.Mixin[props] != 'undefined') {
		// is a mixin
		// prevent duplicates
		if(this.prototype._includes.indexOf(props) === -1) {
			this.prototype._includes.push(props);
			// this.prototype._mixins.push(props);
			props = YLib.Mixin[props];
		}
	}
	YLib.extend(this.prototype, props);
};
YLib.Class.mergeOptions = function (options) {
	YLib.extend(this.prototype.options, options);
};
YLib.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};



YLib.Mixin = {};


})();
