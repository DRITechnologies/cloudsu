/**
 * Created by jopitz on 12/15/2014.
 */

var gulp   = require( 'gulp' ),
	rimraf = require( 'gulp-rimraf' ),
	exec   = require( 'gulp-exec' ),
	insert = require( 'gulp-insert' ),
	seq    = require( 'run-sequence' ),
	rename = require( 'gulp-rename' ),
	argv   = require( 'yargs' ).argv,

	_comma = 'commafix: tired of the hassle of remembering to add/remove a comma for the last var'

///////////////////////
//	TASKS
///////////////////////

var ver = argv.ver ? '#' + argv.ver : '';
var vs = ver || 'latest';
var src = argv.src;


console.log( 'version: ', vs )

gulp.task( 'init', function()
{
	return gulp.src( [ './dist' ], { read: false } )
		.pipe( rimraf( { force: true } ) );
} )

gulp.task( 'curl', function()
{
	src = src || './tmp'

	var v = argv.ver ||
			(function() {throw new Error( 'manually building requires a valid version number e.g. 0.13.0' )})()

	var norm = 'ui-bootstrap-tpls-' + v + '.js';
	var mini = 'ui-bootstrap-tpls-' + v + '.min.js';

	return gulp.src( '' )
		.pipe( exec( 'mkdir ./tmp && ' +
					 'curl -o ./tmp/' + norm + ' http://angular-ui.github.io/bootstrap/' + norm + ' && ' +
					 'curl -o ./tmp/' + mini + ' http://angular-ui.github.io/bootstrap/' + mini ) )

} )

gulp.task( 'package', function()
{
	src = src || './node_modules/_tmp/dist'

	return gulp.src( [ src + '/ui-bootstrap-tpls-*.js' ] )
		.pipe( insert.append( 'if(typeof module!==\'undefined\')module.exports=\'ui.bootstrap\';' ) ) //just making this compatible with common-js packages for use w/ browserify
		.pipe( gulp.dest( './tmp' ) )
} )

gulp.task( 'rename', function()
{
	gulp.src( './tmp/*.min.js' )
		.pipe( rename( 'angular-bootstrap.min.js' ) )
		.pipe( gulp.dest( './dist' ) )

	return gulp.src( [ './tmp/*.js', '!./tmp/*.min.js' ] )
		.pipe( rename( 'angular-bootstrap.js' ) )
		.pipe( gulp.dest( './dist' ) )
} )

gulp.task( 'clean', function()
{
	return gulp.src( [ './tmp', './node_modules/_tmp' ], { read: false } )
		.pipe( rimraf( { force: true } ) );
} )

///////////////////////
//	DEFAULT
///////////////////////


gulp.task( 'default', function() { seq( 'init', 'curl', 'package', 'rename', 'clean' );} )