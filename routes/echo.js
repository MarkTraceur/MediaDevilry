var im = require( 'gm' ).subClass( { imageMagick: true } );

module.exports = { name: 'echo' };

module.exports.register = function ( app ) {
	app.get( '/echo', function ( req, res ) {
		res.render( 'echo' );
	} );

	app.post( '/echo', function ( req, res ) {
		var gotfile;

		function tryConvert() {
			if ( !gotfile ) {
				return;
			}

			im( gotfile )
				.stream( function ( err, stdout, stderr ) {
					stdout.pipe( res );
				} );
		}

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
