var im = require( 'gm' ).subClass( { imageMagick: true } );

module.exports = { name: 'rotate' };

module.exports.register = function ( app ) {
	app.get( '/rotate', function ( req, res ) {
		res.render( 'rotate' );
	} );

	app.post( '/rotate', function ( req, res ) {
		var degs, gotfile, color;

		function tryConvert() {
			if ( !degs || !gotfile || !color ) {
				// Need more fields to be filled
				return;
			}

			im( gotfile )
				.rotate( color, degs )
				.stream( function ( err, stdout, stderr ) {
					stdout.pipe( res );
				} );
		}

		req.busboy.on( 'field', function ( fieldname, val ) {
			if ( fieldname === 'degrees' ) {
				degs = val;
			}

			if ( fieldname === 'color' ) {
				color = val;
			}

			tryConvert();
		} );

		req.busboy.on( 'file', function ( fieldname, file, filename, enc, type ) {
			if ( fieldname !== 'file' ) {
				return;
			}

			gotfile = file;
			tryConvert();
		} );

		req.pipe( req.busboy );
	} );
};
