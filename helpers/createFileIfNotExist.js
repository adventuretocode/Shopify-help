const fs = require("fs");
const fsWriteFile = require("./fsWriteFile.js");

/**
 * File system create a file with json object
 * 
 * @param  {String} fileName     The full path and also the file name 
 *                                Example : path.join(__dirname, myFile)
 * @return {Promise}             Promise object if the file exist
 */

const createFileIfNotExist = function(fileName) {
  return new Promise(async function(resolve, reject) {
    try {
      if(!fs.existsSync(fileName)) {
        fsWriteFile(fileName, {});
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = createFileIfNotExist;
