'use strict';
import gulp from 'gulp';
import pug from 'gulp-pug';
import concat from 'gulp-concat';
import sass from 'gulp-sass';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import babelify from 'babelify';
import buffer from 'vinyl-buffer';
import plugins from 'gulp-load-plugins';
import source from 'vinyl-source-stream';
import imagemin from 'gulp-imagemin';
import minifyCss from 'gulp-minify-css';
import minifyHTML from 'gulp-minify-html';
import inlineImages from 'gulp-inline-images';
import svgo from 'gulp-svgo';
import injectSvg from 'gulp-inject-svg';

const dirs = {
  src: './src',
  dist: './dist'
}

gulp.task('w', ['sass', 'html', 'scripts', 'imagemin'], () => {
  browserSync.init({
    server: `${dirs.dist}`
  });

  gulp.watch(`${dirs.src}/*.pug`, ['html']).on('change', browserSync.reload);
  gulp.watch(`${dirs.src}/styles/**/*.scss`, ['sass']).on('change', browserSync.reload);
  gulp.watch(`${dirs.src}/scripts/**/*.js`, ['scripts']);
  gulp.watch(`${dirs.dist}/scripts/bundle.js`).on('change', browserSync.reload);
  gulp.watch(`${dirs.src}/images/**/*.[png,jpg]`, ['imagemin']).on('change', browserSync.reload);
});

gulp.task('html', () =>
  gulp.src(`${dirs.src}/*.pug`)
    .pipe(pug())
    .pipe(inlineImages({
      basedir: `${dirs.src}`
    }))
    .pipe(svgo())
    .pipe(injectSvg({base: `${dirs.src}`}))
    .pipe(minifyHTML({ conditionals: true }))
    .pipe(gulp.dest(`${dirs.dist}`))
);

gulp.task('sass', () => {
  gulp.src(`${dirs.src}/styles/**/*.scss`)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(minifyCss({ compatibility: 'ie9' }))
    .pipe(gulp.dest(`${dirs.dist}/styles`))
    .pipe(browserSync.stream())
});


gulp.task('scripts', ['mainjs', 'bundlejs']);

gulp.task('mainjs', () => {
  return browserify({ 
    entries: [`${dirs.src}/scripts/main.js`], 
    debug: true,
    transform: [
      babelify.configure({
        'presets': ['es2015']
      })
    ]
  })
  .bundle()
  .on('error', function () {
    var args = Array.prototype.slice.call(arguments);

    plugins().notify.onError({
      'title': 'Compile Error',
      'message': '<%= error.message %>'
    }).apply(this, args);

    this.emit('end');
  })
  .pipe(source('main.min.js'))
  .pipe(buffer())
  .pipe(plugins().sourcemaps.init({'loadMaps': true}))
  .pipe(plugins().sourcemaps.write('.'))
  .pipe(gulp.dest(`${dirs.dist}/scripts`))
  .pipe(browserSync.stream());
})

gulp.task('bundlejs', () =>
  gulp.src(`${dirs.src}/scripts/vendor/*.js`)
    .pipe(gulp.dest(`${dirs.dist}/scripts`))
);

gulp.task('imagemin', () =>
  gulp.src([`${dirs.src}/images/**/*`,`!${dirs.src}/images/inline/*`])
    .pipe(imagemin())
    .pipe(gulp.dest(`${dirs.dist}/images`))
);

gulp.task('font', () =>
  gulp.src(`${dirs.src}/font/**/*`)
    .pipe(gulp.dest(`${dirs.dist}/font`))
);

gulp.task('default', ['w', 'html', 'font', 'imagemin']);

