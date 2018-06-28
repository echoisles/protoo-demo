var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var connect = require("gulp-connect");
var uglify = require('gulp-uglify-es').default;
var gutil = require('gulp-util');

// 编译ES6
gulp.task('es6', function() {
  browserify({
    entries: './src/js/main.js',
    debug: true
  })
    .on('error',swallowError)
    .transform(babelify.configure({
      presets : ["es2015"]
    }))
    .on('error',swallowError)
    .bundle()
    .on('error',swallowError)
    .pipe(source('sdkDemo.js'))
    .on('error',swallowError)
    .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
    .on('error',swallowError)
    .pipe(uglify())
    .on('error',swallowError)
    .pipe(gulp.dest('./dist/'))
    .pipe(connect.reload());
});

// 监视文件，自动执行
gulp.task('watch', function () {
  gulp.watch('./src/js/*.js', ['es6']);
});

// 创建一个WEB服务
gulp.task('connect', function () {
  connect.server({
    root: './',
    livereload: true,
    host:'0.0.0.0',
    port: 4000,
  });
});

function swallowError (error) {

  // If you want details of the error in the console
  console.log(error.toString())

  this.emit('end')
}

gulp.task('default', ['connect', 'watch']);