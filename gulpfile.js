'use strict';

let gulp = require('gulp');
// let pug = require('gulp-pug');
//必須有這條不然 gulp-load-plugins 會有問題
let sass = require('gulp-sass');
// let plumber = require('gulp-plumber');
// let postcss = require('gulp-postcss');
let autoprefixer = require('autoprefixer');
//針對 gulp 開頭套件使用
const $ = require('gulp-load-plugins')();
let mainBowerFiles = require('main-bower-files');
let browserSync = require('browser-sync').create();
let minimist = require('minimist');
var gulpSequence = require('gulp-sequence')

//設置條件、參數，利用 minimist 呼叫
let evnOption = {
  string: 'env',
  default: {
    env: 'develop'
  }
}
let options = minimist(process.argv.slice(2), evnOption);
console.log(options)


//清理垃圾檔案
gulp.task('clean', function () {
  return gulp.src(['./.tmp','./public'], {
      read: false
    })
    .pipe($.clean());
});

gulp.task('copyHTML', function () {
  return gulp.src('./source/**/*.html')
    .pipe(gulp.dest('./public/'))
})

gulp.task('pug', function buildHTML() {
  //這樣/**/的寫法會針對所有子資料夾做編譯
  return gulp.src('./source/*.pug')
    .pipe($.plumber())
    .pipe($.pug({
      pretty: true
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(browserSync.stream())
});

sass.compiler = require('node-sass');

gulp.task('sass', function () {
  // 這段要配 .pipe(postcss(plugins))使用
  /* var plugins = [
    autoprefixer()
  ]; */
  return gulp.src('./source/scss/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync().on('error', $.sass.logError))
    // --編譯完成 css--
    // .pipe(postcss(plugins))
    //配合 package.json 的 browserslist 參數使用
    // .pipe(postcss([autoprefixer()]))
    //配合（load-plugins)使用
    .pipe($.postcss([autoprefixer()]))
    //利用gulp if 寫判斷
    .pipe($.if(options.env === 'production', $.minifyCss()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream())
});

gulp.task('babel', () =>
  gulp.src('./source/js/**/*.js')
  //sourcemaps 的部分啟動會顯示原先的 js 位置
  .pipe($.sourcemaps.init())
  .pipe($.babel({
    presets: ['@babel/env']
  }))
  .pipe($.concat('all.js'))
  .pipe($.if(options.env === 'production', $.uglify({
    compress: {
      drop_console: true
    }
  })))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('./public/js'))
  .pipe(browserSync.stream())
);

gulp.task('bower', function () {
  return gulp.src(mainBowerFiles({
      "overrides": {
        "vue": { // 套件名稱
          "main": "dist/vue.js" // 取用的資料夾路徑
        }
      }
    }))
    .pipe(gulp.dest('./.tmp/vendors'))
});

//加入陣列優先執行會報錯,那個是 3 版的寫法
gulp.task('vendorJs', function () {
  return gulp.src('./.tmp/vendors/**/**.js')
    .pipe($.concat('vendors.js'))
    .pipe($.if(options.env === 'production', $.uglify()))
    .pipe(gulp.dest('./public/js'))
});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./public"
    }
  });
});

gulp.task('watch', function () {
  //4版 gulp 尾巴不能再寫 ['sass'],要改成 gulp.series('sass')
  gulp.watch('./source/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('./source/*.pug', gulp.series('pug'));
  gulp.watch('./source/js/*.js', gulp.series('babel'));
});

//最終輸出(gulp squence 不用了)
gulp.task('out', gulp.series('clean', gulp.parallel('pug', 'sass', 'babel', gulp.series('bower', 'vendorJs'))))

//4版要用 parallel ,3 版直接陣列
//4版以 series 順序執行 bower vendors
gulp.task('default', gulp.parallel('pug', 'sass', 'babel', gulp.series('bower', 'vendorJs'), 'browser-sync', 'watch'));