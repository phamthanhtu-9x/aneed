/*
 * grunt-naming
 *
 *
 * Copyright (c) 2019 FastCoding Inc.
 * Licensed under the ISC license.
 */

'use strict';

module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('naming', 'A multi-task to validate your files', function () {

    var options = this.options({
      naming: true
    });

    if (options.naming) {

      this.files.forEach(function (f) {

        f.src.filter(function (filepath) {
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }
        }).map(function (filepath) {

          var fileContent = grunt.file.read(filepath);
          var output = [];

          if (fileContent.match(/class="(.*?)"/g)) {
            fileContent.match(/class="(.*?)"/g).forEach(function (classnames) {
              classnames.replace('class="', '').replace('"', '').split(' ').forEach(function (classname) {
                output.push(classname);
              });
            });
          }

          if (fileContent.match(/id="(.*?)"/g)) {
            fileContent.match(/id="(.*?)"/g).forEach(function (classnames) {
              classnames.replace('id="', '').replace('"', '').split(' ').forEach(function (classname) {
                output.push(classname);
              });
            });
          }

          if (fileContent.match(/href="(.*?)"/g)) {
            fileContent.match(/href="(.*?)"/g).forEach(function (classnames) {
              classnames.replace('href="', '').replace('"', '').split(' ').forEach(function (classname) {
                output.push(classname);
              });
            });
          }

          if (fileContent.match(/src="(.*?)"/g)) {
            fileContent.match(/src="(.*?)"/g).forEach(function (classnames) {
              classnames.replace('src="', '').replace('"', '').split(' ').forEach(function (classname) {
                output.push(classname);
              });
            });
          }

          var outputUnique = output.filter(function (item, index) {
            return output.indexOf(item) >= index;
          }).sort();

          grunt.log.writeln('# File ' + filepath + ':');

          outputUnique.forEach(function (classname) {
            grunt.log.writeln(classname);
          });

        });



      }); // End forEach

    } // End options.naming

  });

};
