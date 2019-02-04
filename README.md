# ylib.js
YLib is a small js library containing several useful features for developers. 
It consists of several code modules and can be built with different configurations.
By default available configurations are "core" (minimal), "default" (usually needed features) and "full" (all modules).

See release folder to download production ready uncompressed or minified versions of YLib.

# Modules

### YLib.Class
YLib.Class allows to build and inherit/extend javascript classes.

```javascript
var MyClass = YLib.Class.extend({
  className: 'MyClass', // useful for debugging, will be shown when logging MyClass / new MyClass().
  statics: {}, // props defined here will be available at MyClass.propName
  includes: ["Events"], // array of string names. Used for loading Mixins from YLib.Mixins[name].
  initialize: function(arg1,arg2) {}, // will be called when executing new MyClass(arg1,arg2).
  
  someNewProp: "My new property",
  someNewMethod: myMethod() {},
});
var MyChildClass = MyClass.extend({
  className: 'MyChildClass',
  includes: ["Hooks"], // Child Class has Events and Hooks now
  initialize: function(arg1,arg2) {
    MyClass.prototype.initialize.call(this,arg1,arg2);
  }, 
  someNewProp: "My new child property", // overrides someNewProp of MyClass
});
var theInstance = new MyChildClass('test1','test2');
```

### YLib.Mixin
Mixins can be used to "mix in" additional functionality to YLib.Classes where needed.

#### Events
Events mixin adds possibility to listen to and fire events on the Class.
When mixed in following methods are available:
* addEventListener(eventType,listenerFunction,[functionContext],[justOnce])
* hasEventListeners(eventType)
* removeEventListener(eventType,listenerFunction,[functionContext]
* clearAllEventListeners()
* fireEvent(eventType,additionalData) (listeners will receive an argument like {eventType:'X',target:theClass,...additionalData}. )

There are shorthand aliases available for these functions: on(), off(), once(), fire().

#### Hooks
Hooks are similar to Events. But instead of Events the listeners are not passive.
Instead they may modify/add data actively.
* addHookSubscriber(eventType,listenerFunction,[functionContext],[justOnce])
* hasHookSubscriber(eventType)
* removeHookSubscriber(eventType,listenerFunction,[functionContext]
* removeAllHookSubscribers()
* callHook(eventType,theData)

Shorthand methods: addHook, removeHook

```javascript
obj.addHook('myhook',function(hook,data) { data.modified = true }
var data = { stuff:true };
obj.callHook('myhook',data);
// data is { stuff:true, modified:true } now.
```
