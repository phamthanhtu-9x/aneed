'use strict';

var grunt = require('grunt');
var sass = require('sass');

require('load-grunt-tasks')(grunt);

module.exports = function (grunt) {

  grunt.config.set('src', '..');
  grunt.config.set('dist', '..');
  grunt.config.set('useRootPath', false);
  grunt.config.set('devMode', false);

  grunt.initConfig({

    conf: {
      src: grunt.config.get('src'),
      dist: grunt.config.get('dist')
    },

    postcss: {
      options: {
        map: false,
        processors: [
          require('postcss-discard-duplicates')()
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'tmp/css',
          src: ['**/*.css'],
          dest: 'tmp/css_02',
          ext: '.css'
        }]
      }
    },

    sass: {
      dist: {
        options: {
          implementation: sass,
          outputStyle: 'expanded',
          unixNewlines : true,
          sourceMap: grunt.config.get('devMode') ? true : false
        },
        files: [{
          expand: true,
          cwd: '<%= conf.src %>/sass',
          src: ['**/*.sass'],
          dest: 'tmp/css',
          ext: '.css'
        }]
      }
    },

    autoprefixer: {
      options: {
        map: grunt.config.get('devMode') ? true : false,
        browsers: ['last 4 version'],
        cascade: false
      },
      dist: {
        files: [{
          expand: true,
          cwd: grunt.config.get('devMode') ? 'tmp/css' : 'tmp/css_02',
          src: ['**/*.css'],
          dest: '<%= conf.dist %>/css',
          ext: '.css'
        }]
      }
    },

    stylelint: {
      options: {
        configFile: '.stylelintrc.json',
        formatter: 'string',
        ignoreDisables: false,
        failOnError: true,
        outputFile: '',
        reportNeedlessDisables: false,
        fix: true,
        syntax: ''
      },
      src: ['tmp/css_02/**/*.css']
    },

    clean: {
      options: {
        force: true
      },
      dev: [
        'tmp',
      ],
    },

    watch: {
      sass: {
        files: ['<%= conf.src %>/sass/**/*.sass'],
        tasks: grunt.config.get('devMode') ? ['sass', 'autoprefixer'] : ['sass', 'postcss', 'stylelint', 'autoprefixer']
      },
    },

    concurrent: {
      all: grunt.config.get('devMode') ? [['sass', 'autoprefixer']] : [['sass', 'postcss', 'stylelint', 'autoprefixer']]
    }

  });

  grunt.registerTask('default', [
    'clean',
    'concurrent:all',
    'watch'
  ]);

  grunt.registerTask('quick', [
    'clean',
    'concurrent:all',
    'watch'
  ]);

};
