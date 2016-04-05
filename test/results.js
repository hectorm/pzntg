var pzntg = (typeof pzntg === 'undefined') ? require('../lib/pzntg.js') : pzntg;

var comp =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4' +
	'HsAAAADFBMVEUAAAD4OACsfAD/pEAePM4XAAAABHRSTlMA////sy1AiAAAAV1JRE' +
	'FUeAGNwTkOAzEMA0Ae//9zWKggBDveGWy8wFe8wFe8wFe8wBf8CDf8CDf8CDf8CD' +
	'daPBQOvGjxUDjwosVD4cCLFg+FA/9oOBQuChecaDgULgoXnGg4FC4KF5xoOBQuCh' +
	'ecaDg0XBQu2DQcGi4KF2waDg0XhQs2DYeGi8IFm4oXLThR8aIFJypetOBExYsW/O' +
	'MHvPgBL37Aix/wjwpDBV+oMFTwhQpDBV+oMFTwooWhwVDBiRaGBkMFJ1oYGgwVnG' +
	'hhaDBUsOmAixY0HXDRgqYDLlrQdMBFC5qLguHgcDAUHmguCoaDw8FQeKC5KBgODg' +
	'dD4YHmomA4OBwMhQeaF164oHnhhQuaF164oHnhhQuaCx880Fz44IHmwgcPNBc+eO' +
	'CEC4IL/uGC4IJ/uCC44B8uCC640YKiBSdaULTgRAuKFpxoQdGCTQcoOkDTAYoO0H' +
	'SAogM0HaDoAOMHES8UMTNc9bEAAAAASUVORK5CYII=';

pzntg.create({
	pixels: [
		[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
		[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
		[0,0,0,2,2,2,2,3,3,2,3,0,0,0,0,0],
		[0,0,2,2,3,2,3,3,3,2,3,3,3,0,0,0],
		[0,0,2,2,3,2,2,3,3,3,2,3,3,3,0,0],
		[0,0,2,2,2,3,3,3,3,2,2,2,2,0,0,0],
		[0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
		[0,0,0,2,2,2,1,2,2,2,0,0,0,0,0,0],
		[0,0,2,2,2,2,1,2,2,1,2,2,2,0,0,0],
		[0,2,2,2,2,2,1,1,1,1,2,2,2,2,0,0],
		[0,3,3,3,2,1,3,1,1,3,1,2,3,3,0,0],
		[0,3,3,3,3,1,1,1,1,1,1,3,3,3,0,0],
		[0,3,3,3,1,1,1,1,1,1,1,1,3,3,0,0],
		[0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0],
		[0,0,2,2,2,2,0,0,0,2,2,2,2,0,0,0],
		[0,2,2,2,2,2,0,0,0,2,2,2,2,2,0,0]
	],
	palette: [
		[  0,   0,   0,   0],
		[248,  56,   0, 255],
		[172, 124,   0, 255],
		[255, 164,  64, 255]
	],
	scale: 4,
	callback: function(res) {
		if (res === comp) console.log('Test: OK');
		else throw new Error('Test: FAIL');
	}
});

