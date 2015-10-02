var gulp = require('gulp');

// Static server
gulp.task('browser-sync', function() {
    gulp.browserSync.init({
        server: {
            baseDir: "./_site/"
        }
    });

    gulp.watch("./_site/**/*.html").on('change', gulp.browserSync.reload);
});
