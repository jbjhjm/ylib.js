
/*!
 *	@todo PrivateParts Info
 */

YLib.PrivateParts = function(){

	function createBound(obj) {
	  return function() {
	    return Object.create(obj || Object.prototype);
	  };
	}

	return {
		createKey : function(factory) {

			// Create the factory based on the type of object passed.
			factory = typeof factory == 'function' ? factory : createBound(factory);

			// Store is used to map public objects to private objects.
			var store = new WeakMap();

			// Seen is used to track existing private objects.
			var seen = new WeakMap();
			return function(key) {
				if (typeof key != 'object') return;

				var value = store.get(key);
				if (!value) {
					if (seen.has(key)) {
						value = key;
					} else {
						value = factory(key);
						store.set(key, value);
						seen.set(value, true);
					}
				}
				return value;
			};
		}
	}

}();
