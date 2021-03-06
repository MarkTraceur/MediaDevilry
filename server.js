/**
 * API for image manipulation
 */

var server,

	express = require( 'express' ),
	busboy = require( 'connect-busboy' ),

	transforms = require( './transforms' ),
	routes = require( './routes' ),

	app = express();

app.set( 'views', './templates' );
app.set( 'view engine', 'jade' );

app.use( busboy() );

app.get( '/', function ( req, res ) {
	res.render( 'index', {} );
} );

routes.register( app, transforms );

server = app.listen( 2666, function () {
	console.log( 'Listening on port %d', server.address().port );
} );
