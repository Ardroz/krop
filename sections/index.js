/* jslint node: true */
'use strict';
var fs = require('fs');

module.exports = function (server) {
  fs.readdirSync(__dirname).forEach(function (file) {
    var fullpath    = __dirname + '/' + file,
        isDirectory = fs.lstatSync(fullpath).isDirectory(),
        invisible = (file.indexOf('_') === 0);

    if (isDirectory && !invisible && fs.existsSync(fullpath + '/index.js')) {
      require(fullpath + '/index.js')(server);
    }
  });
};
