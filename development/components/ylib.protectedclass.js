

YLib.ProtectedClassFactory = function(name,definition) {

       var ProtectedClassFactory = function() {

            var createKey = YLib.PrivateParts.createKey;
            var constructorToClassMap = new WeakMap;
            var protectToPrototypeMap = new WeakMap;

            function Class(name, definition, parent) {
                if (typeof name == "function") {
                    parent = definition;
                    definition = name;
                    name = null;
                }
                this.definition = definition;
                this.parent = parent;
                this.Ctor = createConstructor(name);
 				YLib.extend(this.Ctor.prototype, YLib.Class.prototype);
                this.Ctor.prototype._initHooks = [];
                this.Ctor.prototype.callInitHooks = callInitHooks;
               	this.Ctor.extend = subclass;
               	this.Ctor.subclass = subclass;
                this.Ctor.final = final;
                constructorToClassMap.set(this.Ctor, this);
                this._setupInheritance();
                this._storeSecrets();
            };

            Class.prototype.construct = function() {
            	var props = {};
                if (typeof this.definition == "function") {
                    this.definition.call(this.Ctor, this.Ctor.prototype, this.protectedKey, this.protectedMethods, this.privateKey, this.privateMethods);
                }
                if(this.parent) {
	                //inherit parent's statics
					for (var i in this.parent) {
						if (this.parent.hasOwnProperty(i) && i !== 'prototype') {
							this.Ctor[i] = this.parent[i];
						}
					}
					// mix static properties into the class
					if (this.Ctor.prototype.statics) {
						YLib.extend(this.Ctor, this.Ctor.prototype.statics);
						delete this.Ctor.prototype.statics;
					}
					// mix includes into the prototype.
                    // new includes can be a function returning an object which gains access to protecteds/privates!
					if (this.Ctor.prototype.includes) {
                        for (var i=0; i<this.Ctor.prototype.includes.length; i++) {
                            if(typeof this.Ctor.prototype.includes[i] == 'function') {
                                var include = this.Ctor.prototype.includes[i].call(this.Ctor, this.Ctor.prototype, this.protectedKey, this.protectedMethods, this.privateKey, this.privateMethods);
                            } else {
                                var include = this.Ctor.prototype.includes[i];
                                YLib.Util.extend.apply(null, [this.Ctor.prototype, include]);
                            }
                        }
						delete this.Ctor.prototype.includes;
					}
					// merge options
					if (this.Ctor.prototype.options && this.Ctor.prototype.options) {
						this.Ctor.prototype.options = YLib.extend({}, this.Ctor.prototype.options, this.Ctor.prototype.options);
					}
				}

                return this.Ctor;
            };
            Class.prototype._setupInheritance = function() {
                if (this.parent) {
                    this.Ctor.__super__ = this.parent.Ctor;
                    this.Ctor.prototype = Object.create(this.parent.Ctor.prototype, {
                        constructor: {
                            value: this.Ctor
                        },
                        __super__: {
                            value: this.parent.Ctor.prototype
                        }
                    });
                }
            };
            Class.prototype._storeSecrets = function() {
                if (this.parent) {
                    this.protectedKey = this.parent.protectedKey;
                    this.protectedMethods = Object.create(this.parent.protectedMethods, {
                        __super__: {
                            value: this.parent.protectedMethods
                        }
                    })
                } else {
                    this.protectedMethods = {};
                    this.protectedKey = createKey(protectedFactory);
                }
                protectToPrototypeMap.set(this.Ctor.prototype, this.protectedMethods);
                this.privateMethods = {};
                this.privateKey = createKey(this.privateMethods);
            };

            function subclass(name, definition) {
                if (typeof name == "function") {
                    definition = name;
                    name = null;
                }
                var parent = constructorToClassMap.get(this);
                if (parent.final) throw new Error("Cannot subclass constructors marked final.")
                return new Class(name, definition, parent).construct()
            };

            function callInitHooks() {
                // console.log('callInitHooks',this._initHooksCalled);

                if (this._initHooksCalled) return;
                // console.log('callInitHooks->parent');
                // if (this.__proto__.__super__ && typeof this.__proto__.__super__.callInitHooks == 'function') {
                //     this.__proto__.__super__.callInitHooks();
                // }

                this._initHooksCalled = true;
                // console.log('check inithooks array');
                if(!(this._initHooks instanceof Array)) return;
                console.log('callInitHooks: process '+this._initHooks.length+' init hooks');
				for (var i = 0, len = this._initHooks.length; i < len; i++) {
					if(typeof this._initHooks[i] == 'function') this._initHooks[i].call(this);
				}

            };

            function final() {
                var cls = constructorToClassMap.get(this);
                cls.final = true;
            };

            function protectedFactory(instance) {
                var publicPrototype = Object.getPrototypeOf(instance);
                var protectedPrototype = protectToPrototypeMap.get(publicPrototype);
                if (!protectedPrototype) throw new Error("The protected key function only accepts instances " + "of objects created using Mozart constructors.")
                return Object.create(protectedPrototype);
            };

            function createConstructor(name) {
                if (!name) name = "";
                var factory = new Function("return function " + name + "() {\n" + "if (typeof this.initialize == 'function')" + "this.initialize.apply(this, arguments); if (this._initHooks) this.callInitHooks.apply(this); }");
                return factory();
            };
            
            return Class;

        };

        ProtectedClassFactory = ProtectedClassFactory();
        return new ProtectedClassFactory(name, definition).construct();

};

// class definition is compatible with YLib.Class.extend parameters.
// you can add prototype.statics, prototype.mixins, prototype.options and prototype._initHooks.
YLib.ProtectedClass = YLib.ProtectedClassFactory('ProtectedClass',function(prototype, _, _protected) {
	
});

