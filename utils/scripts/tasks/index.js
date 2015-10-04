var gulp = require('gulp'),
    clean = require('gulp-clean'),
    browserSync = require('browser-sync').create();

gulp.browserSync = browserSync;

// Utils
gulp.task('clean', function () {
  return gulp.src('./site/**/*')
             .pipe(clean({force: true}));
});
gulp.task('watch', ['browser-sync', 'watch:style', 'watch:static']);

// Build
gulp.task('build', ['clean','build-static','style'], function (cb) {
  console.log('Build done.');
  cb();
});

// Dev
gulp.task('dev', ['build', 'watch'], function (cb) {
  console.log('Build done.');
  cb();
});

gulp.task('default', ['build']);
