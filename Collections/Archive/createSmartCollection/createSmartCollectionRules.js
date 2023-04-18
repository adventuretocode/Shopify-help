const createSmartCollectionRest = require("../helpers/createSmartCollectionRest.js");

/**
 * Setting up rules and creating the collection
 * 
 * @param   {String}            title      The title of the collection 
 * @param   {Array<{ Object }>} rulesArray The rules to create a smart collection
 * @returns {Promise<Number>}              The ID of the smart collection
 */

const createSmartCollectionRules = function(title, rulesArray) {
  return new Promise(async function(resolve, reject) {
    try {
      const postBody = {
        smart_collection: {
          title: title,
          rules: rulesArray
        }
      };

      const { smart_collection: { id } } = await createSmartCollectionRest(postBody);
      resolve(id);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = createSmartCollectionRules;
