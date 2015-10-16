var im = require( 'gm' ).subClass( { imageMagick: true } );

module.exports = { name: 'crop' };

module.exports.register = function ( app ) {
	app.get( '/crop', function ( req, res ) {
		res.render( 'crop' );
	} );

	app.post( '/crop', function ( req, res ) {
		var width, height, x, y, gotfile;

		function tryConvert() {
			if ( !gotfile || !width || !height || !x || !y ) {
				// Need more fields to be filled
				return;
			}

			im( gotfile )
				.crop( width, height, x, y )
				.stream( function ( err, stdout, stderr ) {
					stdout.pipe( res );
				} );
		}

		req.busboy.on( 'field', function ( fieldname, val ) {
			switch ( fieldname ) {
				case 'width':
					width = val;
					break;
				case 'height':
					height = val;
					break;
				case 'x':
					x = val;
					break;
				case 'y':
					y = val;
					break;
				default:
					break;
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
