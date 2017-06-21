
(function () {

/*!
 *	sprintf implementation programmed by Alexei - thanks!
 *	https://github.com/alexei/sprintf.js
 */
    YLib.Util.sprintf = function() {
        var key = arguments[0], cache = YLib.Util.sprintf.cache;
        if (!(cache[key] && cache.hasOwnProperty(key))) {
            cache[key] =  YLib.Util.sprintf.parse(key);
        }
        return  YLib.Util.sprintf.format.call(null, cache[key], arguments);
    }

    YLib.Util.sprintf.cache = {}
    YLib.Util.sprintf.re = {
        not_string: /[^s]/,
        number: /[def]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    }

    YLib.Util.sprintf.format = function(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = "";
        for (i = 0; i < tree_length; i++) {
            node_type = YLib.Util.sprintf.get_type(parse_tree[i]);
            if (node_type === "string") {
                output[output.length] = parse_tree[i];
            }
            else if (node_type === "array") {
                match = parse_tree[i]; // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]));
                        }
                        arg = arg[match[2][k]];
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]];
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++];
                }

                if (YLib.Util.sprintf.get_type(arg) == "function") {
                    arg = arg();
                }

                if (YLib.Util.sprintf.re.not_string.test(match[8]) && (YLib.Util.sprintf.get_type(arg) != "number" && isNaN(arg))) {
                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", YLib.Util.sprintf.get_type(arg)));
                }

                if (YLib.Util.sprintf.re.number.test(match[8])) {
                    is_positive = arg >= 0;
                }

                switch (match[8]) {
                    case "b":
                        arg = arg.toString(2);
                    break
                    case "c":
                        arg = String.fromCharCode(arg);
                    break
                    case "d":
                        arg = parseInt(arg, 10);
                    break
                    case "e":
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                    break
                    case "f":
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                    break
                    case "o":
                        arg = arg.toString(8);
                    break
                    case "s":
                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg);
                    break
                    case "u":
                        arg = arg >>> 0;
                    break
                    case "x":
                        arg = arg.toString(16);
                    break
                    case "X":
                        arg = arg.toString(16).toUpperCase();
                    break
                }
                if (!is_positive || (YLib.Util.sprintf.re.number.test(match[8]) && match[3])) {
                    sign = is_positive ? "+" : "-";
                    arg = arg.toString().replace(YLib.Util.sprintf.re.sign, "");
                }
                pad_character = match[4] ? match[4] == "0" ? "0" : match[4].charAt(1) : " ";
                pad_length = match[6] - (sign + arg).length;
                pad = match[6] ? YLib.Util.sprintf.str_repeat(pad_character, pad_length) : "";
                output[output.length] = match[5] ? sign + arg + pad : (pad_character == 0 ? sign + pad + arg : pad + sign + arg);
            }
        }
        return output.join("");
    }

    YLib.Util.sprintf.parse = function(fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
        while (_fmt) {
            if ((match = YLib.Util.sprintf.re.text.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = match[0];
            }
            else if ((match = YLib.Util.sprintf.re.modulo.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = "%";
            }
            else if ((match = YLib.Util.sprintf.re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if ((field_match = YLib.Util.sprintf.re.key.exec(replacement_field)) !== null) {
                        field_list[field_list.length] = field_match[1];
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                            if ((field_match = YLib.Util.sprintf.re.key_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1];
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1];
                            }
                            else {
                                throw new SyntaxError("[sprintf] failed to parse named argument key");
                            }
                        }
                    }
                    else {
                        throw new SyntaxError("[sprintf] failed to parse named argument key");
                    }
                    match[2] = field_list;
                }
                else {
                    arg_names |= 2;
                }
                if (arg_names === 3) {
                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
                }
                parse_tree[parse_tree.length] = match;
            }
            else {
                throw new SyntaxError("[sprintf] unexpected placeholder");
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return parse_tree;
    }

    YLib.Util.sprintf_array = function(fmt, argv, _argv) {
        _argv = (argv || []).slice(0);
        _argv.splice(0, 0, fmt);
        return YLib.Util.sprintf.apply(null, _argv);
    }
    YLib.Util.sprintf.get_type = function(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    YLib.Util.sprintf.str_repeat = function(input, multiplier) {
        return Array(multiplier + 1).join(input);
    }


}());