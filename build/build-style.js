const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
// 编译less
gulp.task('css', function() {
    gulp.src('../src/theme/components/*.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie > 8']
        }))
        .pipe(gulp.dest('../dist/styles/'));
});

gulp.task('default', ['css']);
