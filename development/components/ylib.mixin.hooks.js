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
					break;
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
