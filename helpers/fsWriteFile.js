import beautify from "json-beautify";
import fs from "fs";

/**
 * File system create a file with json object
 *
 * @param  {String} fileName     The full path and also the file name
 *                                Example : path.join(__dirname, myFile)
 * @param  {Object} jsonObj      The object to be printed on the disk
 * @return {Promise}             Promise object represents the success or failure of writing to disk
 */

var fsWriteFile = (fileName, jsonObj) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, beautify(jsonObj, null, 2, 80), function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

export default fsWriteFile;
