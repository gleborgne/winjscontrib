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
var nuget = require('gulp-nuget');
var foreach = require('gulp-foreach');
var Stream = require("stream");
var shell = require('gulp-shell');
var insert = require('gulp-insert');
var merge = require('merge-stream');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var flatten = require('gulp-flatten');
var bom = require('gulp-bom');
//var config = require('./build.config.json');


var WinJSContribVersion = "2.1.0.6";

var typingsPath = 'Sources/typings/';
var srcCorePath = 'Sources/Core/';
var srcSearchPath = 'Sources/Search/';
var srcCommonPath = 'Sources/Common/';
var srcControlsPath = 'Sources/Controls/';
var srcDataContainerPath = 'Sources/DataContainer/';
var srcWinRTPath = 'Sources/WinRT/';
var jsFilesPath = 'Sources/Samples/MCNEXT WinJS Contrib.Shared/scripts/winjscontrib/';
var jsDestPath = 'dist/bin/js/';
var cssFilesPath = 'Sources/Samples/MCNEXT WinJS Contrib.Shared/css/winjscontrib/';
var cssDestPath = 'dist/bin/css/';
var tsDestPath = 'dist/bin/ts/';
var samplesPath = 'Sources/Samples/';

function licenseHeader(){
	return '/* \r\n' +
	' * WinJS Contrib v' + WinJSContribVersion + '\r\n' +
	' * licensed under MIT license (see http://opensource.org/licenses/MIT)\r\n' +
	' * sources available at https://github.com/gleborgne/winjscontrib\r\n' +
	' */\r\n\r\n';
}

var onError = function(err) {
	//notify.onError({
	//	title:    "Gulp",
	//	subtitle: "Failure!",
	//	message:  "Error: <%= error.message %>",
	//	sound:    "Beep"
	//})(err);

	this.emit('end');
};

gulp.task('cleannuget', function(cb) {
	del(['dist/nuget/*.nupkg', 'dist/nuget/publish'], cb);
});

gulp.task('distrib', ['cleannuget', 'build'], function() {
	return gulp.src(['dist/nuget/*.nuspec']).pipe(foreach(function(stream, file){
		console.log('process file: ' + file.path);

		return stream.pipe(nuget.pack({ nuspec: file.path, nuget: 'dist/Lib/nuget.exe', version: WinJSContribVersion }))
		.pipe(bom())
		.pipe(gulp.dest('dist/nuget'))
		.pipe(shell(['"dist/Lib/nuget.exe" Push <%= file.path %>']));
	}));
});

gulp.task('cleanstyles', function(cb) {
	return del(['dist/bin/css'], cb);
});

gulp.task('cleanscripts', function(cb) {
	return del(['dist/bin/js', 'dist/bin/ts'], cb);
});

gulp.task('cleandoc', function(cb) {
	return del(['dist/documentation'], cb);
});

function compileLessFilesIn(path){
	return gulp.src([path + '**/*.less'])
	.pipe(plumber({errorHandler: onError}))
	.pipe(less())	
	//.pipe(bom())
	.pipe(gulp.dest(path))
}

gulp.task('styles', ['cleanstyles'], function() {
	var header = licenseHeader();
	gulp.src([srcCommonPath + 'winjscontrib.mixin.less'])
		//.pipe(bom())
		.pipe(gulp.dest(cssDestPath));

	return merge(
		compileLessFilesIn(srcCorePath),
		compileLessFilesIn(srcCommonPath),
		compileLessFilesIn(srcControlsPath),
		compileLessFilesIn(srcWinRTPath)
		)	
	.pipe(insert.prepend(header))
	.pipe(bom())
	.pipe(gulp.dest(cssDestPath))	
	//.pipe(gulp.dest('src/'))
	.pipe(minifycss())
	.pipe(rename(function (path) {
        if(path.extname === '.css') {
            path.basename += '.min';
        }
    }))
    .pipe(insert.prepend(header))
    .pipe(bom())
    .pipe(gulp.dest(cssDestPath))
	//.pipe(concat('main.css'))
	
});

gulp.task('sourcesstyles', function() {
	return gulp.src(['Sources/**/*.less', '!Sources/**/bld/**/*.less', '!Sources/**/bin/**/*.less', '!Sources/**/bld/**/*.less'], { base : '.' })
	.pipe(plumber({errorHandler: onError}))
	.pipe(less())
	//.pipe(bom())
	.pipe(gulp.dest(''));	
});

var tsCoreProject = ts.createProject({
    declarationFiles: true,
	noExternalResolve: true,
	target : 'ES5',
    noEmitOnError : false
});


gulp.task('corecompile', function() {
	var tsResult = gulp.src([
		typingsPath + '*.d.ts', 
		srcCorePath + 'winjscontrib.core.logging.ts',		 
		srcCorePath + 'winjscontrib.core.utils.ts', 
		srcCorePath + 'winjscontrib.core.ui.ts', 
		srcCorePath + 'winjscontrib.core.pages.ts',
	], { base : '.' })	
	.pipe(plumber({errorHandler: onError}))
	.pipe(sourcemaps.init()) 
	.pipe(ts(tsCoreProject));
    return merge([
        tsResult.dts.pipe(flatten()).pipe(concat('winjscontrib.core.d.ts')).pipe(bom()).pipe(gulp.dest(tsDestPath)),
        tsResult.js
            .pipe(concat('winjscontrib.core.js'))
        	.pipe(sourcemaps.write("."))
        	.pipe(bom())
        	.pipe(gulp.dest(srcCorePath))
    ]);
});

var tsSearchProject = ts.createProject({
    declarationFiles: true,
	noExternalResolve: true,
	target : 'ES5',
    noEmitOnError : false
});

gulp.task('searchcompile', ["corecompile", "typescript", "datacontainercompile"], function() {
	var tsResult = gulp.src([
		typingsPath + '*.d.ts', 
		tsDestPath + 'winjscontrib.core.d.ts',
		tsDestPath + 'winjscontrib.messenger.d.ts',
		srcDataContainerPath + '*.d.ts', 	
		srcSearchPath + 'winjscontrib.search.ts', 
		srcSearchPath + 'winjscontrib.search.index.ts', 
		srcSearchPath + 'winjscontrib.search.indexgroup.ts', 
		srcSearchPath + 'winjscontrib.search.indexworkerproxy.ts', 
		srcSearchPath + 'winjscontrib.search.stemming.ts', 
		//srcCorePath + 'winjscontrib.core.ui.ts', 
		//srcCorePath + 'winjscontrib.core.pages.ts'		 
	], { base : '.' })	
	.pipe(plumber({errorHandler: onError}))
	.pipe(sourcemaps.init()) 
	.pipe(ts(tsSearchProject));
    return merge([
        tsResult.dts.pipe(flatten()).pipe(concat('winjscontrib.search.d.ts')).pipe(bom()).pipe(gulp.dest(tsDestPath)),
        tsResult.js
            .pipe(concat('winjscontrib.search.js'))
        	.pipe(sourcemaps.write("."))
        	.pipe(bom())
        	.pipe(gulp.dest(srcSearchPath))
    ]);
});

var tsDataContainerProject = ts.createProject({
    declarationFiles: true,
	noExternalResolve: true,
	target : 'ES5',
    noEmitOnError : false
});

gulp.task('datacontainercompile', ["corecompile"], function() {
	var tsResult = gulp.src([
		typingsPath + '*.d.ts', 
		tsDestPath + 'winjscontrib.core.d.ts',
		srcDataContainerPath + '*.d.ts', 		
		srcDataContainerPath + 'winjscontrib.datacontainer.winrt.file.ts',
		srcDataContainerPath + 'winjscontrib.datacontainer.localstorage.ts'
		//srcSearchPath + 'winjscontrib.search.indexgroup.ts', 
		//srcSearchPath + 'winjscontrib.search.indexworkerproxy.ts', 
		//srcSearchPath + 'winjscontrib.search.stemming.ts', 
		//srcCorePath + 'winjscontrib.core.ui.ts', 
		//srcCorePath + 'winjscontrib.core.pages.ts'		 
	], { base : '.' })	
	.pipe(plumber({errorHandler: onError}))
	.pipe(sourcemaps.init()) 
	.pipe(ts(tsDataContainerProject));
    return merge([
        tsResult.dts.pipe(flatten()).pipe(bom()).pipe(gulp.dest(tsDestPath)),
        tsResult.js
            .pipe(sourcemaps.write("."))
        	.pipe(bom())
        	.pipe(gulp.dest(srcSearchPath))
    ]);
});


var tsGlobalProject = ts.createProject({
    declarationFiles: true,
	noExternalResolve: true,
	target : 'ES5',
    noEmitOnError : false
});

gulp.task('typescript', ["corecompile"], function() {
	var tsResult = gulp.src([
		typingsPath + '*.d.ts', 
		typingsPath + 'react/*.d.ts', 
		tsDestPath + 'winjscontrib.core.d.ts',
		srcCorePath + 'winjscontrib.ui.pages.ts', 
		srcCommonPath + '*.ts', 
		srcControlsPath + '*.ts', 
		srcWinRTPath + '*.ts', 
	], { base : '.' })	
	.pipe(plumber({errorHandler: onError}))
	.pipe(sourcemaps.init()) 
	.pipe(ts(tsGlobalProject));
    return merge([
        tsResult.dts.pipe(flatten()).pipe(bom()).pipe(gulp.dest(tsDestPath)),
        tsResult.js
        	.pipe(sourcemaps.write("."))
        	.pipe(bom())
        	.pipe(gulp.dest(''))
    ]);
});

gulp.task('jshint', ['cleanscripts', 'typescript'], function() {
	gulp.src([srcCommonPath + 'winjscontrib.dynamicscripts.html']).pipe(bom()).pipe(gulp.dest(jsDestPath));
	var header = licenseHeader();
	
	return gulp.src([
		srcCorePath + 'winjscontrib.core.js',
		srcCorePath + 'winjscontrib.ui.webcomponents.js',
		srcCorePath + 'winjscontrib.ui.pages.js',
		srcSearchPath + 'winjscontrib.search.js',
		srcCommonPath + '*.js',
		srcControlsPath + '*.js',
		srcWinRTPath + '*.js'
		])        
	.pipe(plumber({errorHandler: onError}))
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

gulp.task('scripts', ['cleanscripts', 'typescript', 'searchcompile'], function() {
	gulp.src([srcCommonPath + 'winjscontrib.dynamicscripts.html']).pipe(bom()).pipe(gulp.dest(jsDestPath));
	var header = licenseHeader();
	
	return gulp.src([
		srcCorePath + 'winjscontrib.core.js',
		srcCorePath + 'winjscontrib.ui.webcomponents.js',
		srcCorePath + 'winjscontrib.ui.pages.js',
		srcSearchPath + 'winjscontrib.search.js',
		srcSearchPath + 'winjscontrib.search.worker.js',		
		srcCommonPath + '*.js',		
		srcControlsPath + '*.js',
		srcDataContainerPath + '*.js',
		srcWinRTPath + '*.js'
		])        
	.pipe(plumber({errorHandler: onError}))
	//.pipe(jshint())
	//.pipe(jshint.reporter('default'))
	.pipe(insert.prepend(header))
	.pipe(bom())
	.pipe(gulp.dest(jsDestPath))
	    
	.pipe(rename(function (path) {
        if(path.extname === '.js') {
            path.basename += '.min';
        }
    }))
	.pipe(uglify({ outSourceMap: true }))
	//.pipe(uglify())
	//.pipe(concat('main.js'))
	.pipe(insert.prepend(header))
	.pipe(bom())
	.pipe(gulp.dest(jsDestPath));
});



//gulp.task('jsondoc', ['cleandoc'], function() {
//	//ink-docstrap module within gulp-jsdoc is not up to date, update it with latest version
//	
//	var infos = {
//		name : 'WINJS Contrib',
//		applicationName : 'WinJS Contrib an',
//		description : 'helpers and controls to complement WinJS',
//		plugins: ['plugins/markdown']
//	};
//
//	var template = {
//	    path: 'ink-docstrap',
//	    systemName      : 'WinJS Contrib',
//	    footer          : "by MCNEXT",
//	    copyright       : "copyright MCNEXT",
//	    navType         : "vertical",
//	    theme           : "cosmo",
//	    linenums        : true,
//	    collapseSymbols : false,
//	    inverseNav      : false
//	  };
//
//	return gulp.src([jsFilesPath +'**/winjscontrib.logger.js', 'readme.md'])        
//	.pipe(plumber({errorHandler: onError}))
//	.pipe(jsdoc.parser(infos))
//  	.pipe(gulp.dest('dist/testsjsdoc'));
//});

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


	return gulp.src([jsDestPath +'**/*.js', '!' + jsDestPath +'**/*.min.js','readme.md'])        
	.pipe(plumber({errorHandler: onError}))
	.pipe(jsdoc.parser(infos))
  	.pipe(jsdoc.generator('dist/documentation/', template));
});


gulp.task('watch', function() {
	gulp.watch([
		'Sources/**/*.less', '!Sources/**/bld/**/*.less', '!Sources/**/bin/**/*.less', '!Sources/**/bld/**/*.less'
	], ['sourcesstyles']);

	gulp.watch([
		typingsPath + '*.d.ts', 
		srcCorePath + '*.ts', 
		srcCommonPath + '*.ts', 
		srcControlsPath + '*.ts', 
		srcWinRTPath + '*.ts', 
	], ['typescript']);
});

gulp.task('buildAndDoc', ['build', 'doc']);
gulp.task('build', ['styles', 'scripts']);

gulp.task('default', ['build']);