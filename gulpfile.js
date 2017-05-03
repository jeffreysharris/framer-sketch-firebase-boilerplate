var gulp = require('gulp');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var sketch = require('gulp-sketch');
var browserSync = require('browser-sync');
var buffer = require('vinyl-buffer'); // to transform the browserify results into a 'stream'
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var deploy = require('gulp-gh-pages');
var runSeq = require('run-sequence');
var changed = require('gulp-changed');
var browserify = require('browserify');

// LOAD ENIVRONMENTAL VARIABLES
require('dotenv').config();

// GULP TASKS

gulp.task('build', ['copy', 'coffee', 'sketch']);
gulp.task('post', function(){
    runSeq(['coffee', 'sketch'], 'deploy');
});
gulp.task('default', ['build', 'watch']);

gulp.task('watch', function(){

  gulp.watch('./src/*.coffee', ['coffee']);
  gulp.watch('./src/*.sketch', ['sketch']);
  gulp.watch('build/**/*', ['deploy']) ;

  browserSync({
    server: {
      baseDir: 'build'
    },
    browser: 'google chrome',
    injectChanges: false,
    files: ['build/**/*.*'],
    notify: false
  })

})

gulp.task('coffee', function(){
    browserify({
    entries: ["./src/app.coffee"],
    debug: true,
    extensions: [".coffee"],
    paths: ["./src/modules", "../node_modules"],
    transform: ["coffeeify"] // npm install --save-dev coffeeify
    })
    .bundle()
    .on('error', function(err){
    gutil.log(
    gutil.colors.red("Browserify compile error:"),
    err.toString()
    );
    })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true,debug: true}))
    .pipe(sourcemaps.write("./" /* optional second param here */))
    .pipe(gulp.dest('build'))
})

gulp.task('sketch', function(){
  gulp.src('src/*.sketch')
    .pipe(sketch({
      export: 'slices',
      format: 'png',
      saveForWeb: true,
      scales: 1.0,
      trimmed: false
    }))
    .pipe(gulp.dest('build/images'))

// export Sketch slices into slices.json
    var util = require('util'),
    exec = require('child_process').exec,
    child;
    child = exec('sketchtool list slices src/*.sketch > build/slices.json', // command line argument directly in string
      function (error, stdout, stderr) {      // one easy function to capture data/errors
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });
})

gulp.task('copy', function(){
  gulp.src('src/index.html')
    .pipe(gulp.dest('build'))
  gulp.src('src/framer/**/*.*')
    .pipe(gulp.dest('build/framer'))
  gulp.src('src/images/**/*.{png, jpg, svg}')
    .pipe(gulp.dest('build/images'))
})

//DEPLOY TO GITHUB PAGES
gulp.task('deploy', function(){
    return gulp.src("build/**/*").pipe(deploy());
})
