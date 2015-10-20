module.exports = {
	name: 'crop',
	args: {
		x: { type: 'number', required: true },
		y: { type: 'number', required: true },
		width: { type: 'number', required: true },
		height: { type: 'number', required: true }
	}
};

module.exports.perform = function ( imstream, args ) {
	return imstream.crop( args.width, args.height, args.x, args.y );
};
