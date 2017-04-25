
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
