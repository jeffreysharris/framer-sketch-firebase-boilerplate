var gulp = require('gulp');
var fs = require('fs');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var sketch = require('gulp-sketch');
var browserSync = require('browser-sync');
var buffer = require('vinyl-buffer'); // to transform the browserify results into a 'stream'
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var gulpDropbox = require('gulp-dropbox');
var through = require('through2');
var Dropbox = require('dropbox');
var browserify = require('browserify');

// LOAD ENIVRONMENTAL VARIABLES
// .env HOLDS DROPBOX KEYS
require('dotenv').config();

gulp.task('build', ['copy', 'coffee', 'sketch']);
gulp.task('default', ['build', 'deploy', 'watch']);

gulp.task('watch', function(){

  gulp.watch('./src/*.coffee', ['coffee'])
  gulp.watch('./src/*.sketch', ['sketch'])

  // browserSync({
  //   server: {
  //     baseDir: 'build'
  //   },
  //   browser: 'google chrome',
  //   injectChanges: false,
  //   files: ['build/**/*.*'],
  //   notify: false
  // })

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
    var fileContent = fs.readFileSync('build/images/circle.png');
    var dbx = new Dropbox({accessToken: process.env.DROPBOX_TOKEN});
    dbx.filesListFolder({path:''})
        .then(function(response){
            console.log(response);
        })
        .catch(function(error){
            console.log(error);
        });
    dbx.filesUpload({path: '/circle.png', contents: fileContent})
            .then(function(response) {
                console.log(response);
            //   gutil.log(gutil.colors.green("File '" + file.path.replace(file.base, '') + "' created in '" + replacePattern + "'."));
            //   cb(null, file);
            })
            .catch(function(error) {
                console.log(error);
            //   throw new PluginError(PLUGIN_NAME, 'There was an error uploading at least one file to Dropbox. Please check your terminal.');
            //   cb(null, file);
            })
            return false;
        });

    // return gulp.src('./src/images/circle.png')
    //     .pipe(gulpDropbox({
    //         token: process.env.DROPBOX_TOKEN,
    //         path: ''
    //     }));
    // dbx.filesListFolder({path:''})
    //     .then(function(response){
    //         console.log(response);
    //     })
    //     .catch(function(error){
    //         console.log(error);
    //     });
