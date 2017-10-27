// @formatter:off
const cleanCSS         = require('gulp-clean-css');
const concat           = require('gulp-concat');
const del              = require('del');
const ftp              = require('vinyl-ftp');
const gulp             = require('gulp');
const htmlmin          = require('gulp-htmlmin');
const less             = require('gulp-less');
const minify           = require('gulp-minify');
const ngAnnotate       = require('gulp-ng-annotate');
const path             = require('path');
const replace          = require('gulp-replace');
const runSequence      = require('run-sequence');
const stripCssComments = require('gulp-strip-css-comments');
const watch            = require('gulp-watch');
// @formatter:on

gulp.task('build', function () {
    return runSequence
    (
        'clean',
        'less',
        'copyFonts',
        'copyHtml',
        'copyViews',
        'copyImages',
        'copyCss',
        'generateJs',
        'copyJs'
    );
});

gulp.task('clean', function () {
    return del(['dist', 'tmp']);
});

gulp.task('copyCss', function () {
    return gulp.src([
        'app/css/*',
        'bower_components/bootstrap/dist/css/bootstrap.min.css',
    ])
        .pipe(concat('wriggle.css'))
        .pipe(stripCssComments({
            preserve: false
        }))
        .pipe(replace(/\.\.\/fonts/g, '/fonts'))
        .pipe(replace(/^\s*[\r\n]/gm, ''))
        .pipe(gulp.dest('dist'))
});

gulp.task('copyHtml', function () {
    return gulp.src('app/index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'))
});

gulp.task('copyFonts', function () {
    return gulp.src([
        'app/fonts/**'
    ])
        .pipe(gulp.dest('dist/fonts'))
});

gulp.task('copyViews', function () {
    return gulp.src('app/views/*.html')
        .pipe(gulp.dest('dist/views'))
});

gulp.task('copyImages', function () {
    return gulp.src('app/images/**')
        .pipe(gulp.dest('dist/images'))
});

gulp.task('copyJs', function () {
    // @formatter:off
    return gulp.src([
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'bower_components/angular-ui-router/release/stateEvents.min.js',
            'tmp/wriggle.min.js'
        ])
        .pipe(concat('wriggle.js'))
        .pipe(gulp.dest('dist'))
    ;
    // @formatter:on
});

gulp.task('dev', function () {
    gulp.start('build');

    return watch([
        'app/less/*',
        'app/js/**/*.js',
        'app/**/*.html',
        'app/images/**/*',
        'gulpfile.js'
    ], function () {
        gulp.start('build');
    });
});

gulp.task('less', function () {
    return gulp.src(
        [
            'app/less/**/*.less',
        ])
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('app/css'));
});

gulp.task('generateJs', function () {
    // @formatter:off
    return gulp.src([
            'app/js/app.js',
            'app/js/config/*.js',
            'app/js/helper/*.js',
            'app/js/controller/inheritance/*.js',
            'app/js/controller/*.js'
        ])
        .pipe(ngAnnotate())
        .pipe(minify({
            exclude:     ['tasks'],
            ignoreFiles: ['.min.js', '-min.js'],
            noSource:    true
        }))
        .pipe(concat('wriggle.min.js'))
        .pipe(gulp.dest('tmp'))
    ;
    // @formatter:on
});