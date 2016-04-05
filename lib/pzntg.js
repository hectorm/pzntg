'use strict';

var pako = require('pako');
var base64 = require('base64-js');
var crc32 = require('./crc32.js');

var spec = {
	png: new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
	ihdr: {
		type: new Uint8Array([0x49, 0x48, 0x44, 0x52]),
		data: new Uint8Array([
			// Width
			0x00, 0x00, 0x00, 0x00,
			// Height
			0x00, 0x00, 0x00, 0x00,
			// Bit depth
			0x08,
			// Color type
			0x03,
			// Compression method
			0x00,
			// Filter method
			0x00,
			// Interlace method
			0x00
		])
	},
	plte: {
		type: new Uint8Array([0x50, 0x4C, 0x54, 0x45])
	},
	trns: {
		type: new Uint8Array([0x74, 0x52, 0x4E, 0x53])
	},
	idat: {
		type: new Uint8Array([0x49, 0x44, 0x41, 0x54])
	},
	iend: new Uint8Array([
		// Length
		0x00, 0x00, 0x00, 0x00,
		// Type
		0x49, 0x45, 0x4E, 0x44,
		// CRC32
		0xAE, 0x42, 0x60, 0x82
	])
};

function int32ToUint8Array(num) {
	var bytes = new Uint8Array(4);

	for (var i = 3; i >= 0; i--) {
		bytes[i] = num & (255);
		num = num >> 8;
	}

	return bytes;
}

function concatChunks(chunks) {
	var size = 0, cnt = 0, i;

	for (i = 0; i < chunks.length; i++) {
		size += chunks[i].length;
	}

	var out = new Uint8Array(size);

	for (i = 0; i < chunks.length; i++) {
		out.set(chunks[i], cnt);
		cnt += chunks[i].length;
	}

	return out;
}

function createChunk(type, data) {
	var len = int32ToUint8Array(data.length);

	var con = new Uint8Array(type.length + data.length);
	con.set(type, 0);
	con.set(data, type.length);

	var crc = int32ToUint8Array(crc32(con));

	var chunk = new Uint8Array(con.length + 8);
	chunk.set(len, 0);
	chunk.set(con, 4);
	chunk.set(crc, 4 + con.length);

	return chunk;
}

function createImage(pixels, palette, scale, asBase64, zlib_level, zlib_memlevel, zlib_strategy) {
	var height = pixels.length * scale,
		width = pixels[0].length * scale;

	var ihdrBytes = new Uint8Array(spec.ihdr.data),
		plteBytes = new Uint8Array(palette.length * 3),
		trnsBytes = new Uint8Array(palette.length),
		idatBytes = new Uint8Array(height * (width + 1));

	var idatCnt = 0;

	var i, j, s1, s2;

	ihdrBytes.set(int32ToUint8Array(width), 0);
	ihdrBytes.set(int32ToUint8Array(height), 4);

	for (i = 0; i < pixels.length; i++) {
		for (s1 = 0; s1 < scale; s1++) {
			// Every scanline starts with a filter type byte
			idatBytes[idatCnt++] = 0; // None
			for (j = 0; j < pixels[i].length; j++) {
				for (s2 = 0; s2 < scale; s2++) {
					idatBytes[idatCnt++] = pixels[i][j];
				}
			}
		}
	}

	for (i = 0; i < palette.length; i++) {
		plteBytes[i * 3] = palette[i][0];
		plteBytes[i * 3 + 1] = palette[i][1];
		plteBytes[i * 3 + 2] = palette[i][2];
	}

	for (i = 0; i < palette.length; i++) {
		trnsBytes[i] = palette[i][3];
	}

	var imgBytes = concatChunks([
		spec.png,
		createChunk(spec.ihdr.type, ihdrBytes),
		createChunk(spec.plte.type, plteBytes),
		createChunk(spec.trns.type, trnsBytes),
		createChunk(spec.idat.type, pako.deflate(idatBytes, {
			level: zlib_level,
			memLevel: zlib_memlevel,
			strategy: zlib_strategy
		})),
		spec.iend
	]);

	return asBase64 ? 'data:image/png;base64,' + base64.fromByteArray(imgBytes) : imgBytes;
}

var methods = {
	create: function(options) {
		if (typeof options !== 'object' || options === null)
			throw new Error('pzntg: \'options\' parameter must be an object');

		if (typeof options.pixels !== 'object' && options.pixels.constructor !== Array)
			throw new Error('pzntg: \'pixels\' option must be an array');

		if (typeof options.palette !== 'object' && options.palette.constructor !== Array)
			throw new Error('pzntg: \'palette\' option must be an array');

		if (typeof options.scale === 'undefined')
			options.scale = 1;
		else if (typeof options.scale !== 'number' || (options.scale % 1) !== 0 || options.scale < 1)
			throw new Error('pzntg: \'scale\' option must be a positive integer');

		if (typeof options.asBase64 === 'undefined')
			options.asBase64 = true;
		else if (typeof options.asBase64 !== 'boolean')
			throw new Error('pzntg: \'asBase64\' option must be a boolean');

		// http://www.zlib.net/manual.html#Constants
		if (typeof options.zlib_level === 'undefined')
			options.zlib_level = pako.Z_DEFAULT_COMPRESSION;
		else if (typeof options.zlib_level !== 'number' || options.zlib_level < 0 || options.zlib_level > 9)
			throw new Error('pzntg: \'zlib_level\' option must be an integer from 0 to 9');

		if (typeof options.zlib_strategy === 'undefined')
			// Z_RLE give better compression for PNG images
			options.zlib_strategy = pako.Z_RLE;
		else if (typeof options.zlib_strategy !== 'number' || options.zlib_strategy < 0 || options.zlib_strategy > 4)
			throw new Error('pzntg: \'zlib_strategy\' option must be an integer from 0 to 4');

		if (typeof options.zlib_memlevel === 'undefined')
			options.zlib_memlevel = 8;
		else if (typeof options.zlib_memlevel !== 'number' || options.zlib_memlevel < 1 || options.zlib_memlevel > 9)
			throw new Error('pzntg: \'zlib_memlevel\' option must be an integer from 1 to 9');

		if (typeof options.callback !== 'undefined' && typeof options.callback !== 'function')
			throw new Error('pzntg: \'callback\' option must be a function');

		var res = createImage(
			options.pixels,
			options.palette,
			options.scale,
			options.asBase64,
			options.zlib_level,
			options.zlib_memlevel,
			options.zlib_strategy
		);

		if (typeof options.callback === 'function')
			setTimeout(function() {
				options.callback(res);
			}, 0);
		else
			return res;
	}
};

module.exports = methods;

