'use strict';

// http://stackoverflow.com/a/18639999

var crcTable = (function() {
	var crcTable = [], c;

	for (var n = 0; n < 256; n++) {
		c = n;
		for (var k = 0; k < 8; k++) {
			c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		}
		crcTable[n] = c;
	}

	return crcTable;
})();

function crc32(buf) {
	var crc = 0 ^ (-1);

	for (var i = 0; i < buf.length; i++) {
		crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
	}

	return (crc ^ (-1)) >>> 0;
}

module.exports = crc32;

