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

var onError = function(err) {
	notify.onError({
		title:    "Gulp",
		subtitle: "Failure!",
		message:  "Error: <%= error.message %>",
		sound:    "Beep"
	})(err);

	this.emit('end');
};


gulp.task('clean', function(cb) {
	del(['dist/bin'], cb)
});


gulp.task('styles', function() {
	return gulp.src(['MCNEXT WinJS Contrib.Shared/css/winjscontrib/**/*.less'])
	.pipe(plumber({errorHandler: onError}))
	.pipe(less())
	//.pipe(gulp.dest('src/'))
	.pipe(minifycss())
	//.pipe(concat('main.css'))
	.pipe(gulp.dest('dist/bin/css'))
});


gulp.task('scripts', function() {
	return gulp.src(['MCNEXT WinJS Contrib.Shared/scripts/winjscontrib/**/*.js'])        
	.pipe(plumber({errorHandler: onError}))
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
	.pipe(gulp.dest('dist/js/'));
});


gulp.task('cleandoc', function(cb) {
	del(['dist/documentation'], cb)
});

gulp.task('doc', ['cleandoc'], function() {
	return gulp.src(['MCNEXT WinJS Contrib.Shared/scripts/winjscontrib/**/*.js'])        
	.pipe(plumber({errorHandler: onError}))
	.pipe(jsdoc('dist/documentation/'));
});


gulp.task('watch', function() {
	gulp.watch('MCNEXT WinJS Contrib.Shared/css/winjscontrib/**/*.less', ['styles']);
	gulp.watch('MCNEXT WinJS Contrib.Shared/scripts/winjscontrib/**/*.js', ['scripts']);
});


gulp.task('default', ['clean'], function() {
	gulp.start('styles', 'scripts');
});