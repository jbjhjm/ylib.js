
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
