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
	
});

gulp.task('less', function() {
  return gulp.src([
    '**/*.less', 
    '!node_modules/**/*.less',
    '!bin/*', 
    '!obj/*'
    ])
  .pipe(plumber({errorHandler: onError}))
  .pipe(less())
  .pipe(rename(function (path) {
  }))
  .pipe(gulp.dest(''))
  //.pipe(gulp.dest('src/'))
  .pipe(minifycss())
  .pipe(rename(function (path) {
        if(path.extname === '.css') {
            path.basename += '.min';
        }
    }))
    .pipe(gulp.dest(''))
  //.pipe(concat('main.css'))
  
});

gulp.task('watch', function() {
  gulp.watch('**/*.less', ['less']);
});


gulp.task('default', ['less'], function () {
	
});