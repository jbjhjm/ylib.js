/*!
 * Shortened Version of uuid.js
 * Copyright (c) 2010-2012 Robert Kieffer
 * MIT License - http://opensource.org/licenses/mit-license.php
 */
 // Unique ID creation requires a high quality random # generator.  We feature
 // detect to determine the best RNG source, normalizing to a function that
 // returns 128-bits of randomness, since that's what's usually required
(function() {
  var _global = this;

  var _rng;
  var _crypto = _global.crypto || _global.msCrypto;
  if (!_rng && _crypto && _crypto.getRandomValues) {
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      _crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }
  if (!_rng) {
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }
      return _rnds;
    };
  }
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;
    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) {
        buf[i + ii++] = _hexToByte[oct];
      }
    });
    while (ii < 16) {
      buf[i + ii++] = 0;
    }
    return buf;
  }
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }
  var _seedBytes = _rng();
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;
  var _lastMSecs = 0, _lastNSecs = 0;
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];
    options = options || {};
    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 12219292800000;
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;
    b[i++] = clockseq >>> 8 | 0x80;
    b[i++] = clockseq & 0xff;
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }
    return buf ? buf : unparse(b);
  }
  var uuid = v1;
  uuid.v1 = v1;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;
  YLib.Util.uuid = YLib.uuid = uuid;

}).call(this);
