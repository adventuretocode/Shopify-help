const fsWriteFile = require("./fsWriteFile");

/**
 * Append to a json file
 * 
 * @param  {String}        key      The key to locate the value
 * @param  {Object|String} value    The value attached to the key
 * @param  {String}        fileName Full path and also the file name 
 *                                  Example : path.join(__dirname, myFile)
 */

const appendToJson = function(key, value, filePath) {
    return new Promise(async function(resolve, reject) {
        try {
            const json = require(filePath);
            if(!json[key]) {
              json[key] = value
              await fsWriteFile(filePath, json);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = appendToJson;
