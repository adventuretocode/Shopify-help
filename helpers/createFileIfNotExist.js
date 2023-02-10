import fs from "fs";
import fsWriteFile from "./fsWriteFile.js";

/**
 * File system create a file with json object
 * 
 * @param  {String} fileName     The full path and also the file name 
 *                                Example : path.join(__dirname, myFile)
 * @return {Promise}             Promise object if the file exist
 */

const createFileIfNotExist = (fileName) => {
  return new Promise(async (resolve, reject) => {
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

export default createFileIfNotExist;
