/* jslint node: true */
'use strict';

module.exports = {
  csvToArray: function (csv, format) {
    var currentLine,
      i,
      isEmpty,
      j,
      lines = csv.split("\n"),
      arr,
      result = [];

    for (i = 0; i < lines.length; i += 1) {
      arr = [];
      currentLine = lines[i].split(",");

      for (j = 0; j < currentLine.length; j += 1) {
        if (format === 'utf-8') {
          arr.push(decodeURI(decodeURIComponent(encodeURI(encodeURIComponent(currentLine[j])))));
        } else {
          arr.push(currentLine[j]);
        }
      }

      isEmpty = arr.length === 1 && arr[0] === '';

      if (!isEmpty) {
        result.push(arr);
      }
    }
    return result;
  }
};
