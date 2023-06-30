'use strict';

var grunt = require('grunt');
var sass = require('sass');

require('load-grunt-tasks')(grunt);

module.exports = function (grunt) {

  grunt.config.set('src', '');
  grunt.config.set('dist', '..');
  grunt.config.set('useRootPath', false);
  grunt.config.set('devMode', false);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    conf: {
      src: grunt.config.get('src'),
      dist: grunt.config.get('dist')
    },

    pug: {
      html: {
        options: {
          pretty: true,
          spawn: false,
          data: {
            debug: true
          }
        },
        files: [{
          expand: true,
          cwd: 'pug',
          src: ['**/*.pug', '!_layouts/**', '!_parts/**', '!_mixins/**'],
          dest: '<%= conf.dist %>',
          ext: '.html'
        }]
      }
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
          sourceMap: grunt.config.get('devMode') ? true : false,
        },
        files: [{
          expand: true,
          cwd: 'sass',
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

    prettier: {
      files: {
        src: ['tmp/js/scripts.js']
      }
    },

    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= conf.dist %>/js',
          src: '**/scripts.js',
          dest: '<%= conf.dist %>/js'
        }]
      }
    },

    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= conf.dist %>/css',
          src: ['*.css'],
          dest: '<%= conf.dist %>/css',
          ext: '.css'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: '<%= conf.dist %>',
          src: [
            '**/*.html',
            '!dev/**',
            '!wp/**',
            '!node_modules/**'
          ],
          dest: '<%= conf.dist %>'
        }]
      }
    },

    fcKraken: {
      dynamic: {
        files: [{
          expand: true,
          cwd: '<%= conf.dist %>/<%= pkg.configs.krakenImagePath %>_',
          src: ['**/*.{png,jpg,jpeg,gif}'],
          dest: '<%= conf.dist %>/<%= pkg.configs.krakenImagePath %>'
        }]
      }
    },

    copy: {
      jsTmp: {
        files: [{
          expand: true,
          cwd: 'js',
          src: ['*.js'],
          dest: 'tmp/js'
        }]
      },
      jsDist: {
        files: [{
          expand: true,
          cwd: 'tmp/js',
          src: ['**/*'],
          dest: '<%= conf.dist %>/js'
        }]
      },
      fonts: {
        files: [{
          expand: true,
          cwd: 'sass/fonts',
          src: ['**/*'],
          dest: '<%= conf.dist %>/css/fonts'
        }]
      }
    },

    clean: {
      options: {
        force: true
      },
      dist: [
        '<%= conf.dist %>/**/*.html',
        '<%= conf.dist %>/css/*',
        '!<%= conf.dist %>/css/*.min.css',
        '<%= conf.dist %>/js',
        '!<%= conf.dist %>/.git/**',
        '!<%= conf.dist %>/dev/**',
        '!<%= conf.dist %>/wp/**',
        '!<%= conf.dist %>/node_modules/**'
      ],
      devCSS: [
        'tmp/css',
        'tmp/css_02',
      ],
      devJS: [
        'tmp/js',
      ],
    },

    browserSync: {
      dev: {
        options: {
          watchTask: true,
          server: grunt.config.get('useRootPath') ? '<%= conf.dist %>' : '<%= conf.dist %>/..',
          startPath: grunt.config.get('useRootPath') ? '<%= conf.dist %>' : process.cwd().replace(/\\/g, '/').split('/').reverse()[1],
          files: ['<%= conf.dist %>/**/*.{html,css,js}', '!<%= conf.src %>'],
        }
      }
    },

    watch: {
      pug: {
        files: ['pug/**/*.pug', '!pug/_{layouts,parts,mixins}/*.pug'],
        tasks: ['newer:pug']
      },
      pugCommon: {
        files: ['pug/_{layouts,parts,mixins}/*.pug'],
        tasks: ['pug']
      },
      sass: {
        files: ['sass/**/*.sass'],
        tasks: grunt.config.get('devMode') ? ['clean:devCSS', 'sass', 'autoprefixer'] : ['clean:devCSS', 'sass', 'postcss', 'stylelint', 'autoprefixer']
      },
      js: {
        files: ['js/*.js'],
        tasks: ['clean:devJS', 'copy:jsTmp', 'prettier', 'eslint', 'copy:jsDist']
      }
    },

    validation: {
      options: {
        serverUrl: 'https://validator.w3.org/nu/',
        reset: true,
        stoponerror: false,
        generateReport: false,
        reportpath: false
      },
      files: {
        src: [
          '<%= conf.dist %>/**/*.html',
          '!<%= conf.dist %>/dev/**',
          '!<%= conf.dist %>/wp/**',
          '!<%= conf.dist %>/node_modules/**'
        ]
      }
    },

    htmllint: {
      defaultOptions: {
        options: {
          htmllintrc: '.htmllintrc'
        },
        src: [
          '<%= conf.dist %>/**/*.html',
          '!<%= conf.dist %>/dev/**',
          '!<%= conf.dist %>/wp/**',
          '!<%= conf.dist %>/node_modules/**'
        ]
      }
    },

    csslint: {
      all: {
        options: {
          csslintrc: '.csslintrc'
        },
        src: ['<%= conf.dist %>/css/**/*.css']
      }
    },

    eslint: {
      options: {
        configFile: '.eslintrc',
        format: 'stylish',
        failOnError: false,
        fix: true
      },
      target: ['tmp/js/scripts.js']
    },

    fclint: {
      html: {
        options: {
          spelling: true,
          nodoublebr: true
        },
        files: {
          src: [
            '<%= conf.dist %>/**/*.html',
            '!<%= conf.dist %>/.git/**',
            '!<%= conf.dist %>/node_modules/**',
            '!<%= conf.dist %>/dev/**',
            '!<%= conf.dist %>/wp/**',
            '!<%= conf.dist %>/node_modules/**'
          ]
        }
      }
    },

    naming: {
      html: {
        files: {
          src: [
            '<%= conf.dist %>/**/*.html',
            '!<%= conf.dist %>/.git/**',
            '!<%= conf.dist %>/dev/**',
            '!<%= conf.dist %>/wp/**',
            '!<%= conf.dist %>/node_modules/**'
          ]
        }
      }
    },

    concurrent: {
      all: grunt.config.get('devMode') ? ['pug', ['sass', 'autoprefixer'], ['copy:jsTmp', 'prettier', 'eslint', 'copy:jsDist']] : ['pug', ['sass', 'postcss', 'stylelint', 'autoprefixer'], ['copy:jsTmp', 'prettier', 'eslint', 'copy:jsDist']]
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', [
    'clean',
    'concurrent:all',
    'copy:fonts',
    'lint',
    'browserSync',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'pug',
    'sass',
    'autoprefixer',
    'copy:jsTmp',
    'eslint',
    'prettier',
    'copy:jsDist',
    'copy:fonts',
    'lint',
    'htmlmin',
    'cssmin',
    'uglify',
    'imagemin'
  ]);

  grunt.registerTask('lint', [
    'validation',
    'htmllint',
    'csslint',
    'eslint',
    'fclint'
  ]);

  grunt.registerTask('imagemin', [
    'fcMoveImages', 'fcKraken'
  ]);

};
