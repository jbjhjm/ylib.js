/*! 
  * @package    ylib
 * @version    1.0.3
 * @date       2017-06-21
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


YLib.Util.getParamString = function (obj, existingUrl) {
	var params = [];
	for (var i in obj) {
		params.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
	}
	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
};

YLib.Util.getURLParams = function(url){
	var params = {};
	if ( url.indexOf("?") > -1 ) {
		var queryString = url.substr(url.indexOf("?")+1);
		var queryArray = queryString.split("&");
		for ( var i = 0; i < queryArray.length; i++ ){
			var param = queryArray[i].split("=");
			params[param[0]] = param[1];
		}
	}
	return params;
};


YLib.Util.objPath = {
	_splitPath:function(path){
		if(!YLib.Utils.isArray(path)) {
			path=path.split(/[.\[]+/);
		}
		for (var i=0; i<path.length; i++){
			if(path[i].substr(-1)==']') path[i] = parseInt(path[i]);
		};
		// console.log(path);
		return path;
	},
	get:function(obj,path){
		path = this._splitPath(path);
		for (var i=0, len=path.length; i<len; i++){
			if(typeof obj[path[i]] == 'undefined') return undefined;
			obj = obj[path[i]];
		};
		return obj;
	},
	set:function(obj,path,value,createMissing){
		path = this._splitPath(path);
		for (var i=0, len=path.length; i<len; i++){
			if(i+1==len) {
				// last part of path. set value here.
				// console.log('Set value',path,i,len);
				obj[path[i]] = value;
				return true;
			} else {
				// find or add prop.
				// console.log('Go deeper',path,i,len,obj);
				if(typeof obj[path[i]] == 'undefined') {
					if(createMissing) {
						// console.log('create missing',path[i],path[i+1], typeof path[i+1]);
						obj[path[i]] = (typeof path[i+1] == 'number') ? [] : {};
					} else {
						return false;
					}
				}
				obj = obj[path[i]];
			}
		};
	}
};

/*!
 * inheritable YLib.Class based on leaflet.js' base class. Custom prototype.
 */

YLib.Class = function () {};
YLib.Class.prototype.settings = {};
YLib.Class.prototype.DEBUG = false;
YLib.Class.prototype.initialize = function () {

};
YLib.Class.prototype.showError = function(msg){
	$err = jQuery('<div class="msg alert alert-error"></div>');

	 msg = YLib.Util.sprintf('Error: %s', msg);

	if(typeof self.$messageFrame == 'undefined') self.$messageFrame = jQuery('#system-message-container');
	$err.html(msg);
	$err.insertBefore(self.$messageFrame);
	console.error(msg);
};

YLib.Class.prototype.showMessage = function(msg){
	$msg = jQuery('<div class="msg alert alert-notification"></div>');

	if(typeof self.$messageFrame == 'undefined') self.$messageFrame = jQuery('#system-message-container');
	$msg.html(msg);
	$msg.insertBefore(self.$messageFrame);
};

YLib.Class.extend = function (props) {

	// extended class with the new prototype
    var NewClass = new Function("return function " + (props.className?props.className:'YLibClass') + "() {\n"
		+ "if (typeof this.defineProps == 'function') this.defineProps(); "
		+ "if (typeof this.initialize == 'function') this.initialize.apply(this, arguments); "
		+ "if (this._initHooks) this.callInitHooks(arguments); "
		+ "}");
    NewClass = NewClass();

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;
	var proto = new F();
	proto.constructor = NewClass;
	proto._initHooks = [];
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
		props._mixins = [];
		for(var i=0; i<props.includes.length; i++) {
			if(typeof props.includes[i] == 'string' && typeof YLib.Mixin[props.includes[i]] != 'undefined') {
				// is a mixin
				props._mixins.push(props.includes[i]);
				props.includes[i] = YLib.Mixin[props.includes[i]];
			}
		}
		YLib.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = YLib.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	YLib.extend(proto, props);


	var parent = this;
	var self = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype;

	// add method for calling all hooks
	proto.callInitHooks = function (args) {

		if (this._initHooksCalled) { return; }

		if (parent.prototype.callInitHooks) {
			parent.prototype.callInitHooks.call(this,args);
		}

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
		if(!this.prototype._mixins) this.prototype._mixins = [];
		this.prototype._mixins.push(props);
		props = YLib.Mixin[props];
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


//--------------------------- BEGIN OF LEAFLET CODE ------------------------------------------------------------------------------------


var eventsKey = '_ylib_events';

YLib.Mixin.Events = {
	addEventListener: function (types, fn, context, once) { // (String, Function[, Object]) or (Object[, Object])

		// types can be a map of types/handlers
		if (YLib.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey] = this[eventsKey] || {},
		    contextId = context && YLib.stamp(context),
		    i, len, event, type, indexKey, indexLenKey, typeIndex;

		// types can be a string of space-separated words
		types = YLib.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			event = {
				action: fn,
				context: context || this,
				once: once || false,
			};
			type = types[i];

			if (context) {
				// store listeners of a particular context in a separate hash (if it has an id)
				// gives a major performance boost when removing thousands of map layers

				indexKey = type + '_idx',
				indexLenKey = indexKey + '_len',

				typeIndex = events[indexKey] = events[indexKey] || {};

				if (!typeIndex[contextId]) {
					typeIndex[contextId] = [];

					// keep track of the number of keys in the index to quickly check if it's empty
					events[indexLenKey] = (events[indexLenKey] || 0) + 1;
				}

				typeIndex[contextId].push(event);


			} else {
				events[type] = events[type] || [];
				events[type].push(event);
			}
		}

		return this;
	},
	hasEventListeners: function (type) { // (String) -> Boolean
		var events = this[eventsKey];
		return !!events && ((type in events && events[type].length > 0) ||
		                    (type + '_idx' in events && events[type + '_idx_len'] > 0));
	},
	removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])
		if (!this[eventsKey]) {
			return this;
		}

		if (!types) {
			return this.clearAllEventListeners();
		}

		if (YLib.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey],
		    contextId = context && YLib.stamp(context),
		    i, len, type, listeners, j, indexKey, indexLenKey, typeIndex;

		types = YLib.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			type = types[i];
			indexKey = type + '_idx';
			indexLenKey = indexKey + '_len';

			typeIndex = events[indexKey];

			if (!fn) {
				// clear all listeners for a type if function isn't specified
				delete events[type];
				delete events[indexKey];

			} else {
				listeners = context && typeIndex ? typeIndex[contextId] : events[type];

				if (listeners) {
					for (j = listeners.length - 1; j >= 0; j--) {
						if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
							listeners.splice(j, 1);
						}
					}

					if (context && typeIndex && (listeners.length === 0)) {
						delete typeIndex[contextId];
						events[indexLenKey]--;
					}
				}
			}
		}

		return this;
	},
	clearAllEventListeners: function () {
		delete this[eventsKey];
		return this;
	},
	fireEvent: function (type, data) { // (String[, Object])
		if (!this.hasEventListeners(type)) {
			return this;
		}

		var event = YLib.Util.extend({}, data, { type: type, target: this });

		var events = this[eventsKey],
		    listeners, i, len, typeIndex, contextId;

		if (events[type]) {
			// make sure adding/removing listeners inside other listeners won't cause infinite loop
			listeners = events[type].slice();
			var remove = [];
			for (i = 0, len = listeners.length; i < len; i++) {
				if(!listeners[i] || !listeners[i].action) {
					console.log("invalid event handler for event "+type);
					break;
				}
				listeners[i].action.call(listeners[i].context || this, event);
				if(listeners[i].once) remove.push(listeners[i]);
			}
			//remove one time listeners
			for (i = 0, len = remove.length; i < len; i++) {
				this.removeEventListener(type,remove[i].action);
			}
		}

		// fire event for the context-indexed listeners as well
		typeIndex = events[type + '_idx'];
		remove = [];
		for (contextId in typeIndex) {
			listeners = typeIndex[contextId];
			if (listeners) {
				for (i = 0, len = listeners.length; i < len; i++) {
					if(!listeners[i] || !listeners[i].action) {
						console.log("invalid event handler for event "+type);
						break;
					}
					listeners[i].action.call(listeners[i].context || this, event);
					if(listeners[i].once) remove.push(listeners[i]);
				}
			}
		}
		//remove one time listeners
		for (i = 0, len = remove.length; i < len; i++) {
			this.removeEventListener(type,remove[i].action,remove[i].context);
		}

		return this;
	},
	addOneTimeEventListener: function (types, fn, context) {

		return this.addEventListener(types, fn, context, true);
	}
};
YLib.Mixin.Events.on = YLib.Mixin.Events.addEventListener;
YLib.Mixin.Events.off = YLib.Mixin.Events.removeEventListener;
YLib.Mixin.Events.once = YLib.Mixin.Events.addOneTimeEventListener;
YLib.Mixin.Events.fire = YLib.Mixin.Events.fireEvent;

//--------------------------- END OF LEAFLET CODE ------------------------------------------------------------------------------------

/*!
 * Ylib.Mixin:
 * Hook System based on Leaflet.js events
 * http://leafletjs.com
 * (c) 2010-2013, Vladimir Agafonkin
 * (c) 2010-2011, CloudMade
 */

/*
	Similar to an events system but used to offer hooks for a plugin to manipulate data actively instead of just being notified.
	In difference to events system the hook subscribers will be called in order of their subscription. No context namespacing.
*/

var hooksKey = '_ylib_hooks';

YLib.Mixin.Hooks = {
	addHookSubscriber: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])

		// types can be a map of types/handlers
		if (YLib.Util.invokeEach(types, this.addHookSubscriber, this, fn, context)) { return this; }

		var hooks = this[hooksKey] = this[hooksKey] || {},
		    i, len, hook, type, indexKey, indexLenKey, typeIndex;

		// types can be a string of space-separated words
		types = YLib.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			hook = {
				action: fn,
				context: context || this,
			};
			type = types[i];
			hooks[type] = hooks[type] || [];
			hooks[type].push(hook);
		}

		return this;
	},
	hasHookSubscriber: function (type) { // (String) -> Boolean
		var hooks = this[hooksKey];
		return !!hooks && ((type in hooks && hooks[type].length > 0) ||
		                    (type + '_hook' in hooks && hooks[type + '_hook_hooklen'] > 0));
	},
	removeHookSubscriber: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])
		if (!this[hooksKey]) {
			return this;
		}

		if (!types) {
			return this.removeAllHookSubscribers();
		}

		if (YLib.Util.invokeEach(types, this.removeHookSubscriber, this, fn, context)) { return this; }

		var hooks = this[hooksKey],
		    i, len, type, subscribers, j, indexKey, indexLenKey, typeIndex;

		types = YLib.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			type = types[i];
			indexKey = type + '_hook';
			indexLenKey = indexKey + '_hooklen';

			typeIndex = hooks[indexKey];

			if (!fn) {
				// clear all subscribers for a type if function isn't specified
				delete hooks[type];
				delete hooks[indexKey];

			} else {
				subscribers = hooks[type];

				if (subscribers) {
					for (j = subscribers.length - 1; j >= 0; j--) {
						if ((subscribers[j].action === fn) && (!context || (subscribers[j].context === context))) {
							subscribers.splice(j, 1);
						}
					}
				}
			}
		}

		return this;
	},
	removeAllHookSubscribers: function () {
		delete this[hooksKey];
		return this;
	},
	callHook: function (type, data) { // (String[, Object])
		if (!this.hasHookSubscriber(type)) {
			return this;
		}

		var hook = { type: type, target: this };

		var hooks = this[hooksKey],
		    subscribers, i, len, typeIndex;

		if (hooks[type]) {
			// make sure adding/removing subscribers inside other subscribers won't cause infinite loop
			subscribers = hooks[type].slice();
			var remove = [];
			for (i = 0, len = subscribers.length; i < len; i++) {
				if(!subscribers[i] || !subscribers[i].action) {
					console.warn("invalid hook listener for hook "+type+" at index "+i);
					continue;
				}
				subscribers[i].action.call(subscribers[i].context || this, hook, data);
			}
			//remove one time subscribers
			for (i = 0, len = remove.length; i < len; i++) {
				this.removeHookSubscriber(type,remove[i].action);
			}
		}

		return this;
	},
};
YLib.Mixin.Hooks.addHook = YLib.Mixin.Hooks.addHookSubscriber;
YLib.Mixin.Hooks.removeHook = YLib.Mixin.Hooks.removeHookSubscriber;


})();
