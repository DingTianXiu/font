//npm install bower del gulp gulp-autoprefixer gulp-csslint gulp-if gulp-less gulp-minify-html gulp-rev gulp-minify-css gulp-changed gulp-rev-collector gulp-uglify http-server run-sequence browser-sync --save-dev

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    csslint = require('gulp-csslint'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-minify-css'),
    changed = require('gulp-changed'),
    revCollector = require('gulp-rev-collector'),
    minifyHtml = require('gulp-minify-html'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;
var cssSrc = ['app/less/*.less'],
    cssDest = 'build/css',
    jsSrc = 'app/js/**',
    jsDest = 'build/js',
    fontSrc = 'app/font/*',
    fontDest = 'build/font',
    imgSrc = 'app/img/*',
    imgDest = 'build/img',
    cssRevSrc = 'build/css/revCss',
    condition = true;

//Fonts & Images 根据MD5获取版本号
gulp.task('revFont', function(){
    return gulp.src(fontSrc)
        .pipe(rev())
        .pipe(gulp.dest(fontDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/font'));
});
gulp.task('revImg', function(){
    return gulp.src(imgSrc)
        .pipe(rev())
        .pipe(gulp.dest(imgDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/img'));
});
//压缩JS/生成版本号
gulp.task('miniJs', function(){
    return gulp.src(jsSrc)
        .pipe(gulpif(
            condition, uglify()
        ))
        .pipe(rev())
        .pipe(gulp.dest(jsDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});
//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function () {
    return gulp.src(['rev/**/*.json', 'app/less/*.less'])
        .pipe(revCollector())
        .pipe(gulp.dest(cssRevSrc));
});
//检测CSS
gulp.task('lintCss', function(){
    return gulp.src(cssSrc)
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(csslint.failReporter());
});
//压缩/合并CSS/生成版本号
gulp.task('miniCss', function(){
    var newCssSrc = cssRevSrc+"/*.less";
    return gulp.src(newCssSrc)
        .pipe(less())
        .pipe(gulpif(
            condition, minifyCss({
                compatibility: 'ie8'
            })
        ))
        .pipe(rev())
        .pipe(gulpif(
            condition, changed(cssDest)                 //只编译或打包改变过的文件
        ))
        .pipe(autoprefixer({                            //处理浏览器前缀
            browsers: ['last 2 versions'],
            cascade: true,
            remove: true
        }))
        .pipe(gulp.dest(cssDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
});
//编译css
gulp.task("buildCss",function(){
   return gulp.src('app/less/*.less')
       .pipe(less())
       .pipe(autoprefixer({                            //处理浏览器前缀
           browsers: ['last 2 versions'],
           cascade: true,
           remove: true
       }))
       .pipe(gulp.dest('app/css'));
});
//copy html到build/views
gulp.task('htmlViewsCopy',function(){
   return gulp.src('app/views/**')
       .pipe(gulp.dest('build/views'));
});
//压缩Html/更新引入文件版本
gulp.task('miniHtml', function () {
    return gulp.src(['rev/**/*.json', 'app/*.html'])
        .pipe(revCollector())
        .pipe(gulpif(
            condition, minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            })
        ))
        .pipe(gulp.dest('build'));
});
//意外出错？清除缓存文件
gulp.task('delRevCss', function(){
    del(cssRevSrc);
})
//清除生成的目录
gulp.task('clean', function(){
    del(['rev','build']);
});

//
gulp.task('dev', function (done) {
    condition = false;
    runSequence('buildCss',done);
});
//
gulp.task('build', function (done) {
    runSequence(
        ['revFont', 'revImg'],
        ['lintJs'],
        ['revCollectorCss'],
        ['miniCss', 'miniJs'],
        ['htmlViewsCopy','miniHtml','delRevCss'],
        done);
});
gulp.task('watchCss',['buildCss'],browserSync.reload);
gulp.task('serve',['buildCss'],function(){
   browserSync.init({
      server:{
          baseDir:"./"
      }
   });
    gulp.watch("app/less/*.less",['watchCss']);
});

gulp.task('default', ['serve']);