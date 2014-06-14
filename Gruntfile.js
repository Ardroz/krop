/* jslint node: true */
'use strict';
module.exports = function (grunt) {
  var transformify = require('transformify');
  var requires = require('./sections/_default/browser-requires.js' )();


  var addRequires = transformify( function ( x ) {
    return x.replace( '/* modules browserify */', requires);
  });
    // Project configuration.
  grunt.initConfig({
    pkg     : grunt.file.readJSON('package.json'),
    jshint  : {
      all     : [ 'package.json', 'bower.json', 'Gruntfile.js', 'index.js', 'sections/**/*.js' ]
    },
    browserify: {
        dist: {
            files: {
                'public/js/app.js': ['sections/_default/angular-app.js']
            },
            options: {
                transform: [ addRequires, 'browserify-shim'],
                browserifyOptions : { debug : true },
                minify : { mangle : false }
            }
        },
        dev: {
            files: {
                'public/js/app.min.js': ['sections/_default/angular-app.js']
            },
            options: {
                transform: [ addRequires, 'browserify-shim'],
                debug : true,
            }
        }
    },
    uglify  : {
        target : {
            files : { 'public/js/app.min.js' : 'public/js/app.js' }
        },
        options: {
            mangle: false
        }
    },
    clean : [ 'public/js/app.js' ]
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
  grunt.registerTask('default', [
      'jshint',
      'browserify:dist',
      'uglify',
      'clean'
    ]
  );
  grunt.registerTask('dev', [
      'jshint',
      'browserify:dev'
    ]
  );

};
