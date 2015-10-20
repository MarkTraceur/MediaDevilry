var im = require( 'gm' ).subClass( { imageMagick: true } );

module.exports = { name: 'echo' };

module.exports.register = function ( app, transforms ) {
	app.get( '/transform', function ( req, res ) {
		var i, j, transform, arg,
			args = [];

		args.push( { name: 'action', type: 'select', required: true, options: [] } );

		for ( i in transforms.transforms ) {
			transform = transforms.transforms[i];

			args[0].options.push( i );

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

		function tryConvert() {
			var i, transform, j, arg;

			if ( !infile || !actions ) {
				return;
			}

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

			var imstream = im( infile );

			for ( i in actions ) {
				action = actions[i];
				transform = transforms.transform[action];

				imstream = transform.perform( imstream, args[action] );
			}

			imstream.stream( function ( err, stdout, stderr ) {
				stdout.pipe( res );
			} );
		}

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
						args[actname] = matches[1];
					}
				}
			}

			tryConvert();
		} );

		req.busboy.on( 'file', function ( fieldname, file, filename, enc, type ) {
			if ( fieldname !== 'file' ) {
				// Only one file allowed!
				return;
			}

			infile = file;
			tryConvert();
		} );

		req.pipe( req.busboy );
	} );
};
