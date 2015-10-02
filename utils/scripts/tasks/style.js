var gulp = require('gulp'),
    styleDir = __dirname+'/../../_layouts/style/',
    destDir = __dirname+'/../../_site/css/';

//_origin, _destination, _watch
require('sicilia-io-style')(
  styleDir+'index.scss',
  destDir,
  [styleDir+'**/*.scss', './node_modules/sicilia-io-style/src/**/*.scss'],
  gulp,
  gulp.browserSync
);

// Style task
gulp.task('style', ['sass'], function (cb) {
  console.log('Style compiled.');
  cb();
});

gulp.task('watch:style', ['watch:sass'], function (cb) {
  console.log('Running sass watcher.');
  cb();
});
