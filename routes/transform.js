var im = require( 'gm' ).subClass( { imageMagick: true } ),
	concat = require( 'concat-stream' );

module.exports.register = function ( app, transforms ) {
	app.get( '/transform', function ( req, res ) {
		var i, j, transform, arg,
			args = [];

		args.push( { name: 'action', type: 'string', required: true } );

		for ( i in transforms.transforms ) {
			transform = transforms.transforms[i];

			for ( j in transform.args ) {
				arg = transform.args[j];
				arg.name = i + j;
				args.push( arg );
			}
		}

		res.render( 'transform', { args: args } );
	} );

	app.post( '/transform', function ( req, res ) {
		var infile, actions, args = {};

		req.busboy.on( 'finish', function () {
			var i, transform, j, arg,
				imstream = im( infile );

			for ( i in actions ) {
				transform = transforms.transforms[i];

				if ( !transform ) {
					throw new Error( 'Transform ' + transform + ' not found' );
				}

				for ( j in transform.args ) {
					arg = transform.args[j];

					if ( !args[i] || !args[i][j] && arg.required ) {
						return;
					}
				}
			}

			for ( i in actions ) {
				transform = transforms.transforms[i];
				imstream = transform.perform( imstream, args[i] );
			}

			imstream.stream( function ( err, stdout, stderr ) {
				stdout.pipe( res );
			} );
		} );

		req.busboy.on( 'field', function ( fieldname, val ) {
			var re, matches, actname;

			if ( fieldname === 'action' ) {
				actions = {};
				acts = val.split( '|' );

				for ( i in acts ) {
					actions[acts[i]] = true;
				}
			} else {
				re = new RegExp( '^(' + Object.keys( transforms.transforms ).join( '|' ) + ')' );
				matches = fieldname.match( re );

				if ( matches !== null ) {
					actname = matches[1];
					re = new RegExp( '^' + actname + '(' + Object.keys( transforms.transforms[actname].args ).join( '|' ) + ')$' );

					matches = fieldname.match( re );

					if ( matches !== null ) {
						args[actname] = args[actname] || {};
						args[actname][matches[1]] = val;
					}
				}
			}
		} );

		req.busboy.on( 'file', function ( fieldname, file, filename, enc, type ) {
			if ( fieldname !== 'file' ) {
				// Only one file allowed!
				return;
			}

			file.pipe( concat( function ( data ) {
				infile = data;
			} ) );
		} );

		req.pipe( req.busboy );
	} );
};
