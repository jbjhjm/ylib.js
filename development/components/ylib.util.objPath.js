
YLib.Util.objPath = {
	_splitPath:function(path){
		if(!YLib.Utils.isArray(path)) {
			path=path.split(/[.\[]+/);
		}
		for (var i=0; i<path.length; i++){
			if(path[i].substr(-1)==']') path[i] = parseInt(path[i]);
		};
		console.log(path);
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
