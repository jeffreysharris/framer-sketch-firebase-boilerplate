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
>>>>>>> parent of c6bcf60... Init gh-pages
var changed = require('gulp-changed');
var browserify = require('browserify');

// LOAD ENIVRONMENTAL VARIABLES
// .env HOLDS DROPBOX KEYS
require('dotenv').config();

// GOOGLE cloud
// const config = {
//   projectId: process.env.PROJECT,
//   keyFilename: 'framer-sketch-firebase-test-0a2ba7d66558.json'
// };
//
// const storage = require('@google-cloud/storage')(config);
//
// const bucket = storage.bucket('framer-sketch-firebase-test.appspot.com');

//GOOGLE CLOUD UPLOAD TEST

// storage.getBuckets(function(err, buckets){
//     if(!err) {
//         console.log(buckets);
//     }
//     else {
//         console.log(err);
//     }
// })

// bucket.exists(function(err, exists) {
//     if (!err) {
//         console.log(exists);
//     }
//     else {
//         console.log(err);
//     }
// });

// bucket.upload('/Users/jeffrey.harris/Development/framer-sketch-firebase-boilerplate/build/images/circle.png', function(err, file) {
//   if (!err) {
//   }
//   else {
//       console.log(err);
//   }
// });

// GULP TASKS

gulp.task('build', ['copy', 'coffee', 'sketch']);
gulp.task('default', ['build', 'deploy', 'watch']);

gulp.task('watch', function(){

  gulp.watch('./src/*.coffee', ['coffee'])
  gulp.watch('./src/*.sketch', ['sketch'])

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
    paths: ["./src/modules"],
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
    // .pipe(uglify( {
    //       debug: true,
    //       options: {
    //         sourceMap: true,
    //       }
    //   }))
    .pipe(sourcemaps.write("./" /* optional second param here */))
    .pipe(gulp.dest('build'))
  // gulp.src('src/*.coffee')
  //   .pipe(coffee({bare: true}).on('error', gutil.log))
  //   .pipe(gulp.dest('build/'))
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
})

gulp.task('copy', function(){
  gulp.src('src/index.html')
    .pipe(gulp.dest('build'))
  gulp.src('src/framer/**/*.*')
    .pipe(gulp.dest('build/framer'))
  gulp.src('src/images/**/*.{png, jpg, svg}')
    .pipe(gulp.dest('build/images'))
})

gulp.task('deploy', function(){
    //DEPLOY TO GITHUB PAGES
    gulp.task('deploy', function () {
        return gulp.src("/build/**/*")
        .pipe(deploy())
})
