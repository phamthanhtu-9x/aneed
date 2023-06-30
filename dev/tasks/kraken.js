var fs = require('fs-extra'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  getDirName = require('path').dirname,
  os = require('os'),
  isGIF = require('is-gif'),
  isPNG = require('is-png'),
  isJPG = require('is-jpg'),
  async = require('async'),
  chalk = require('chalk'),
  pretty = require('pretty-bytes'),
  stream = require('stream'),
  request = require('request'),
  pjson = require('../package.json');

var Kraken = function (opts) {
    this.auth = {
        api_key: opts.api_key || "",
        api_secret: opts.api_secret || ""
    };
};

/**
 * Creates a http response handler
 *
 * @param {Function} cb
 */
Kraken.prototype._createResponseHandler = function (cb) {
  return function (err, res, body) {
    if (err) {
      return cb(err);
    }

    // in case of unsuccessful request with {wait: true}
    if (body.success === false) {
      return cb(new Error(body.message));
    } else {
      return cb(body);
    }
  }
};


/**
* Pass the given `image` URL along with credentials to Kraken API via HTTPS POST
*
* @param {Object} opts
* @param {Function} cb
* @api public
*/

Kraken.prototype.url = function (opts, cb) {
    opts = opts || {};

    opts.auth = this.auth;

    request.post({
        url: "https://api.kraken.io/v1/url",
        json: true,
        strictSSL: false,
        body: opts
    }, this._createResponseHandler(cb));
};


/**
* Upload the given `file` along with credentials to Kraken API via HTTPS POST.
*
* @param {Object} opts
* @param {Function} cb
* @api public
*/

Kraken.prototype.upload = function (opts, cb) {
    opts = opts || {};

    opts.auth = this.auth;

    var formData = {};

    if (opts.file instanceof stream.Stream) {
        formData.file = opts.file;
    } else {
        formData.file = fs.createReadStream(opts.file);
    }
    delete opts.file;

    formData.data = JSON.stringify(opts);

    request.post({
        url: "https://api.kraken.io/v1/upload",
        json: true,
        strictSSL: false,
        formData: formData
    }, this._createResponseHandler(cb));
};

const removeDir = function (path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function (filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          removeDir(path + "/" + filename)
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  }
};

module.exports = function (grunt) {

  grunt.registerTask('fcMoveImages', 'Move img to img_.', function () {
    const done = this.async();

    if (fs.existsSync(path.join(__dirname, '../../' + pjson.configs.krakenImagePath + '_'))) {
      removeDir(path.join(__dirname, '../../' + pjson.configs.krakenImagePath + '_'));
    }

    fs.copy(path.join(__dirname, '../../' + pjson.configs.krakenImagePath), path.join(__dirname, '../../' + pjson.configs.krakenImagePath + '_'), function (err) {
      if (err) return console.error(err);
      grunt.log.writeln('Copied images from img_ to img.');
      done();
    });

  });

  grunt.registerMultiTask('fcKraken', 'Grunt plugin to optimize all your images with the powerful Kraken.io API', function () {
    var done = this.async(),
      files = this.files,
      options = this.options({
        key: pjson.configs.krakenApiKey,
        secret: pjson.configs.krakenApiSecret,
        lossy: true
      });

    var total = {
      bytes: 0,
      kraked: 0,
      files: 0
    };

    async.forEachLimit(files, os.cpus().length, function (file, next) {
      var isSupported = !isGIF(file.src[0]) || !isPNG(file.src[0]) || !isJPG(file.src[0]);

      if (!isSupported) {
        grunt.log.writeln('Skipping unsupported image ' + file.src[0]);
        return next();
      }

      mkdirp(getDirName(file.dest));

      var kraken = new Kraken({
        // eslint-disable-next-line camelcase
        api_key: options.key,
        // eslint-disable-next-line camelcase
        api_secret: options.secret
      });

      var opts = {
        file: file.src[0],
        lossy: options.lossy || false,
        wait: true
      };

      kraken.upload(opts, function (data) {
        if (!data.success) {
          grunt.log.writeln('Error in file ' + file.src[0] + ': ' + data.message || data.error);
          return next();
        }

        var originalSize = data.original_size,
          krakedSize = data.kraked_size,
          savings = data.saved_bytes;

        var percent = (((savings) * 100) / originalSize).toFixed(2),
          savedMsg = 'saved ' + pretty(savings) + ' - ' + percent + '%',
          msg = savings > 0 ? savedMsg : 'already optimized';

        total.bytes += originalSize;
        total.kraked += krakedSize;
        total.files++;

        request(data.kraked_url, function (err) {
          if (err) {
            grunt.log.writeln(err + ' in file ' + file.src[0]);
            return next();
          }

          grunt.log.writeln(chalk.green('✔ ') + file.src[0] + chalk.gray(' (' + msg + ')'));
          process.nextTick(next);
        }).pipe(fs.createWriteStream(file.dest));
      });
    }, function (err) {
      if (err) {
        grunt.log.writeln(err);
      }

      var percent = (((total.bytes - total.kraked) * 100) / total.bytes).toFixed(2);
      savings = total.bytes - total.kraked;
      msg = 'All done. Kraked ' + total.files + ' image';

      msg += total.files === 1 ? '' : 's';
      msg += chalk.gray(' (saved ' + pretty(savings) + ' - ' + percent + '%)');
      grunt.log.writeln(msg);
      removeDir(path.join(__dirname, '../../' + pjson.configs.krakenImagePath + '_'));
      done();
    });
  });
};
