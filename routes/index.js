var fs = require( 'fs' ),
	path = require( 'path' ),
	
	routes = {};

fs
	.readdirSync( __dirname )
	.filter( function ( file ) {
		return ( file.indexOf( '.' ) !== 0 ) && ( file !== 'index.js' );
	} )
	.forEach( function ( file ) {
		var route = require( path.join( __dirname, file ) );
		routes[route.name] = route;
	} );

module.exports = {};

module.exports.register = function ( app, transforms ) {
	Object.keys( routes ).forEach( function ( routeName ) {
		if ( 'register' in routes[routeName] ) {
			routes[routeName].register( app, transforms );
		}
	} );
};
