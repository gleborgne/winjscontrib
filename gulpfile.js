var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var minifycss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var jsdoc = require("gulp-jsdoc");
var del = require('del');
var rename = require('gulp-rename');
var jsFilesPath = 'MCNEXT WinJS Contrib.Shared/scripts/winjscontrib/';
var nuget = require('gulp-nuget');
var foreach = require('gulp-foreach');
var Stream = require("stream");
var shell = require('gulp-shell');
var insert = require('gulp-insert');

var WinJSContribVersion = "2.0.0.2";

function licenseHeader(){
	return '/* \r\n' +
	' * WinJS Contrib v' + WinJSContribVersion + '\r\n' +
	' * licensed under MIT license (see http://opensource.org/licenses/MIT)\r\n' +
	' * sources available at https://github.com/gleborgne/winjscontrib\r\n' +
	' */\r\n\r\n';
}

var onError = function(err) {
	notify.onError({
		title:    "Gulp",
		subtitle: "Failure!",
		message:  "Error: <%= error.message %>",
		sound:    "Beep"
	})(err);

	this.emit('end');
};

gulp.task('cleannuget', function(cb) {
	del(['dist/nuget/*.nupkg', 'dist/nuget/publish'], cb);
});

gulp.task('distrib', ['cleannuget', 'build'], function() {
	return gulp.src(['dist/nuget/*.nuspec']).pipe(foreach(function(stream, file){
		console.log('process file: ' + file.path);

		return stream.pipe(nuget.pack({ nuspec: file.path, nuget: 'dist/Lib/nuget.exe', version: WinJSContribVersion }))
		.pipe(gulp.dest('dist/nuget'))
		.pipe(shell(['"dist/Lib/nuget.exe" Push <%= file.path %>']));
	}));
});

gulp.task('clean', function(cb) {
	del(['dist/bin'], cb)
});

gulp.task('styles', ['clean'], function() {
	var header = licenseHeader();
	return gulp.src(['MCNEXT WinJS Contrib.Shared/css/winjscontrib/**/*.less'])
	.pipe(plumber({errorHandler: onError}))
	.pipe(less())
	.pipe(insert.prepend(header))
	.pipe(gulp.dest('dist/bin/css'))
	//.pipe(gulp.dest('src/'))
	.pipe(minifycss())
	.pipe(rename(function (path) {
        if(path.extname === '.css') {
            path.basename += '.min';
        }
    }))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest('dist/bin/css'))
	//.pipe(concat('main.css'))
	
});


gulp.task('scripts', ['clean'], function() {
	gulp.src(['MCNEXT WinJS Contrib.Shared/scripts/winjscontrib/winjscontrib.dynamicscripts.html']).pipe(gulp.dest('dist/bin/js/'));
	var header = licenseHeader();
	
	return gulp.src([jsFilesPath + '**/*.js'])        
	.pipe(plumber({errorHandler: onError}))
	.pipe(insert.prepend(header))
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(gulp.dest('dist/bin/js/'))
	    
	.pipe(rename(function (path) {
        if(path.extname === '.js') {
            path.basename += '.min';
        }
    }))
	.pipe(uglify({ outSourceMap: true }))
	//.pipe(uglify())
	//.pipe(concat('main.js'))
	.pipe(insert.prepend(header))
	.pipe(gulp.dest('dist/bin/js/'));
});


gulp.task('cleandoc', function(cb) {
	del(['dist/documentation'], cb)
});

gulp.task('jsondoc', ['cleandoc'], function() {
	//ink-docstrap module within gulp-jsdoc is not up to date, update it with latest version
	
	var infos = {
		name : 'WINJS Contrib',
		applicationName : 'WinJS Contrib an',
		description : 'helpers and controls to complement WinJS',
		plugins: ['plugins/markdown']
	};

	var template = {
	    path: 'ink-docstrap',
	    systemName      : 'WinJS Contrib',
	    footer          : "by MCNEXT",
	    copyright       : "copyright MCNEXT",
	    navType         : "vertical",
	    theme           : "cosmo",
	    linenums        : true,
	    collapseSymbols : false,
	    inverseNav      : false
	  };

	return gulp.src([jsFilesPath +'**/winjscontrib.logger.js', 'readme.md'])        
	.pipe(plumber({errorHandler: onError}))
	.pipe(jsdoc.parser(infos))
  	.pipe(gulp.dest('dist/testsjsdoc'));
});

gulp.task('doc', ['cleandoc'], function() {
	//ink-docstrap module within gulp-jsdoc is not up to date, update it with latest version
	
	var infos = {
		name : 'WINJS Contrib',
		applicationName : 'WinJS Contrib an',
		description : 'helpers and controls to complement WinJS',
		plugins: ['plugins/markdown']
	};

	var template = {
	    path: 'ink-docstrap',
	    systemName      : 'WinJS Contrib',
	    footer          : "by MCNEXT",
	    copyright       : "copyright MCNEXT",
	    navType         : "vertical",
	    theme           : "cosmo",
	    linenums        : true,
	    collapseSymbols : false,
	    inverseNav      : false
	  };

	return gulp.src([jsFilesPath +'**/*.js', 'readme.md'])        
	.pipe(plumber({errorHandler: onError}))
	.pipe(jsdoc.parser(infos))
  	.pipe(jsdoc.generator('dist/documentation/', template));
});


gulp.task('watch', function() {
	gulp.watch('MCNEXT WinJS Contrib.Shared/css/winjscontrib/**/*.less', ['styles']);
	gulp.watch(jsFilesPath +'**/*.js', ['scripts']);
});

gulp.task('build', ['styles', 'scripts']);

gulp.task('default', ['build'], function() {
	gulp.start('doc');
});