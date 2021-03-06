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
