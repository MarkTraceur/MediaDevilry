module.exports = {
	name: 'rotate',
	args: {
		degrees: { type: 'number', required: true },
		color: { type: 'string', required: true }
	}
};

module.exports.perform = function ( imstream, args ) {
	return imstream.rotate( args.color, args.degs );
};
