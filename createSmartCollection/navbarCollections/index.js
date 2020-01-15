const cleanData = require("../../helpers/cleanData.js");
const hasCollectionBeenCreated = require("../../controller/hasCollectionBeenCreated.js");
const createSmartCollectionRules = require("../../controller/createSmartCollectionRules.js");

/**
 * {Promise<Array<{node:{id:String, handle:String}>}
 * @param   {Array<{title:String, rules:[{column:String, relation:String, condition:String}]}>} list A list of 
 * @returns {Promise}
 */

const main = function(list) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < list.length; i++) {
        const { title, rules } = list[i];
        const cleanTitle = cleanData(title);
        const isCollection = await hasCollectionBeenCreated(cleanTitle);
        if (!isCollection) {
          const smartId = await createSmartCollectionRules(cleanTitle, rules);
          console.log(`\u001b[38;5;${smartId % 255}m${title}\u001b[0m`);
        }
      }

      resolve("Completed");
    } catch (error) {
      reject(error);
    }
  });
};

const listOfRequiredCollection = require("./listOfRequiredCollection.json");

main(listOfRequiredCollection)
  .then(console.log)
  .catch(error => console.log("Error: ", error));
