function removeParameterFromUrl(url, parameter) {
	var result=url;
	while (true) {
		var pattern = '[\\?&]' + parameter + '=';
		var start = url.search(pattern);
		if (start > 0) {
			var substr = url.substring(start+parameter.length+3);
			var end = substr.search("[#&\\?]");
			if (end > 0) {
				var append = url.substring(start+parameter.length+3+end);
				if(append[0] === "&") {
					append="?"+append.substring(1);
				}
				url = url.substring(0, start)+append;
			} else {
				url = url.substring(0,start);
			}
		} else {
			return url;
		}
	}
};

// extracts the first occurrence of parameter
function extractParameterFromUrl(url, parameter) {
	var token;
	var pattern = '[\\?&]' + parameter + '=';
	var start = url.search(pattern);
	if (start > 0) {
		var substr = url.substring(start + parameter.length + 2);
		var end = substr.search("[#&\\?]");
		if (end > 0) {
			token = substr.substring(0, end);
		} else {
			token = substr;
		}
	}
	return token;
}

function nowForLastfm() {
	return Math.round(new Date().getTime() / 1000);
}