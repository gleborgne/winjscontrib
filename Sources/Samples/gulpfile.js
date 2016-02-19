var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var minifycss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var del = require('del');
var rename = require('gulp-rename');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var flatten = require('gulp-flatten');
var merge = require('merge-stream');
var bom = require('gulp-bom');

var onError = function(err) {
	//notify.onError({
	//	title:    "Gulp",
	//	subtitle: "Failure!",
	//	message:  "Error: <%= error.message %>",
	//	sound:    "Beep"
	//})(err);

	this.emit('end');
};


gulp.task('clean', function(cb) {
	//del(['Sources/prod'], cb)
});

gulp.task('styles', function() {
	return gulp.src(['**/*.less', '!**/bin/**/*.less', '!**/bld/**/*.less'], { cwd: 'ShowcaseApp',  base : '.' })
	.pipe(plumber({errorHandler: onError}))
	.pipe(less())
	.pipe(bom())
	.pipe(gulp.dest(''));	
});

gulp.task('build', ['clean', 'styles', 'compilewinjscontrib', 'buildpages'], function () {
});

gulp.task('watch', function() {
    gulp.watch(['ShowcaseApp/**/*.less', '!ShowcaseApp/**/bin/**/*.less', '!ShowcaseApp/**/bld/**/*.less'], ['styles']);
});

gulp.task('default', ['build'], function() {
});