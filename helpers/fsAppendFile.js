const fsWriteFile = require("./fsWriteFile");

/**
 * Append to a json file
 *
 * @param  {String}        key      The key to locate the value
 * @param  {Object|String} value    The value attached to the key
 * @param  {String}        fileName Full path and also the file name
 *                                  Example : path.join(__dirname, myFile)
 */

const fsAppendFile = async (key, value, filePath) => {
  try {
    const json = require(filePath);
    if (!json[key]) {
      json[key] = value;
      await fsWriteFile(filePath, json);
    }
    return "OK";
  } catch (error) {
    throw error;
  }
};

export default fsAppendFile;
