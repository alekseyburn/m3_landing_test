const gulp = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');
const server = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const uglyfly = require('gulp-uglyfly');
const babel = require('gulp-babel');
const iife = require('gulp-iife');
const concat = require('gulp-concat');
const order = require('gulp-order');
const ghPages = require('gh-pages');
const purgecss = require('gulp-purgecss');
const critical = require('critical').stream;

const isProduction = process.env.NODE_ENV;

gulp.task('html', () => gulp.src('source/**/*.html')
  // .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'))
  .pipe(server.stream()));

gulp.task('css', () => {
  if (isProduction) {
    return gulp.src('source/sass/style.scss')
      .pipe(plumber())
      .pipe(sass())
      .pipe(postcss([
        autoprefixer(),
      ]))
      .pipe(purgecss({
        content: ['src/index.html'],
      }))
      .pipe(gulp.dest('build/css'))
      .pipe(csso())
      .pipe(rename('style.min.css'))
      .pipe(gulp.dest('build/css'))
      .pipe(server.stream());
  }
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(purgecss({
      content: ['build/**/*.html'],
      whitelist: ['active', 'slide-js', 'visible', 'non-visible', 'slideInLeft', 'slideInRight', 'slideOutLeft', 'slideOutRight','slick-dots', 'slick-active', 'valid', 'invalid', 'success'],
    }))
    .pipe(gulp.dest('build/css'))
    .pipe(cssnano())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('webp', () => gulp.src('source/img/**/*.{png,jpg}')
  .pipe(webp({ quality: 80 }))
  .pipe(gulp.dest('build/img')));

gulp.task('images', () => gulp.src('source/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.jpegtran({ progressive: true }),
    imagemin.svgo(),
    mozjpeg({ quality: 80 }),
    pngquant({
      quality: [0.5, 0.8],
      floyd: 1,
      speed: 1,
    }),
  ]))
  .pipe(gulp.dest('build/img')));

gulp.task('js', () => gulp.src('source/js/modules/**/*.js')
  .pipe(order([
    'loadScripts.js',
    'lazyload.js',
    'slider.js',
    'tilt.js',
    'form.js',
    'animation.js',
  ]))
  .pipe(concat('script.js'))
  .pipe(babel({ presets: ['@babel/preset-env'] }))
  .pipe(uglyfly())
  .pipe(iife({ useStrict: false }))
  .pipe(rename((path) => {
    path.basename += '.min';
  }))
  .pipe(gulp.dest('build/js')));

gulp.task('sprite', () => gulp.src('source/img/{icon,logo}-*.svg')
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img')));

gulp.task('copy', () => gulp.src([
  'source/fonts/**/*.{woff,woff2}',
  'source/img/*.ico',
  'source/css/*.css',
  'source/js/*.js',
], {
  base: 'source',
})
  .pipe(gulp.dest('build')));

gulp.task('clean', () => del('build'));

gulp.task('server', () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css'));
  gulp.watch('source/img/**/*.{jpg,png,svg}', gulp.series('webp', 'images'));
  gulp.watch('source/img/{icon,logo}-*.svg', gulp.series('sprite', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html'));
  gulp.watch('source/js/**/*.js', gulp.series('js', 'refresh'));
});

gulp.task('critical', () => gulp
  .src('build/*.html')
  .pipe(critical({
    base: 'build/',
    inline: true,
    css: [
      'build/css/style.min.css',
    ],
    dimensions: [{
      height: 480,
      width: 320,
    },
    {
      height: 768,
      width: 1024,
    },
    {
      height: 1080,
      width: 1440,
    }],
    ignore: ['@font-face'],
  }))
  .on('error', (err) => {
    log.error(err.message);
  })
  .pipe(gulp.dest('build')));

gulp.task('refresh', (done) => {
  server.reload();
  done();
});

gulp.task('deploy', (cb) => {
  ghPages.publish('build', cb);
});

gulp.task('build', gulp.series('clean', 'copy', 'html', 'css', 'webp', 'images', 'sprite', 'js', 'critical'));
gulp.task('start', gulp.series('build', 'server'));
gulp.task('remote', gulp.series('build', 'deploy'));
