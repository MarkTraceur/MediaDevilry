var fs = require( 'fs' ),
	path = require( 'path' ),
	transforms = {};

fs
	.readdirSync( __dirname )
	.filter( function ( file ) {
		return ( file.indexOf( '.' ) !== 0 ) && ( file !== 'index.js' );
	} )
	.forEach( function ( file ) {
		var transform = require( path.join( __dirname, file ) );
		transforms[transform.name] = transform;
	} );

module.exports = { transforms: transforms };
