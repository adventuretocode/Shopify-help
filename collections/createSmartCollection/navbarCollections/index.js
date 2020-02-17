const cleanData = require("../../../helpers/cleanData.js");
const hasCollectionBeenCreated = require("../../../services/hasCollectionBeenCreated.js");
const createSmartCollectionRules = require("../../../services/createSmartCollectionRules.js");

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
        const isCollection = await hasCollectionBeenCreated(title);
        if (!isCollection) {
          const smartId = await createSmartCollectionRules(title, rules);
          console.log(`\u001b[38;5;${smartId % 255}mCreated: ${title}\u001b[0m`);
        }
      }

      resolve("Completed");
    } catch (error) {
      reject(error);
    }
  });
};

const listOfRequiredCollection = require("./listOfRequiredCollectionTPS.json");

main(listOfRequiredCollection)
  .then(console.log)
  .catch(error => console.log("Error: ", error));
