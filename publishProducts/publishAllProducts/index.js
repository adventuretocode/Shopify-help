/**
 * Prep the ZAuto gallery tags as a JSON
 * to create smart collections
 */

require("dotenv").config();
const path = require("path");
const cleanData = require("../../helpers/cleanData.js");
const restGetProducts = require("../../helpers/restGetProducts.js");
const fsWriteFile = require("../../helpers/fsWriteFile.js");


const recordTag = function(tag, handle, id) {
    return new Promise(async function(resolve, reject) {
        try {
            const json = require(`./ZAutoJsonWithID${process.env.ENV}.json`);
            if(!json[tag]) {
              json[tag] = {
                "id": id,
                "handle": handle
              };
              await fsWriteFile(path.join(__dirname, `./ZAutoJsonWithID${process.env.ENV}.json`), json);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};



const main = async function() {
    try {
        let pages = 1;
        let moreItems = true;
        
        while (moreItems) {
            const shopifyProducts = await restGetProducts(250, pages);
            if(!shopifyProducts) {
                // moreItems = false;
                // throw "Products is null"
                console.log("Product is null");
                continue;
            };

            const { products } = shopifyProducts;

            if(products.length) {
                await (products);
                pages+=1;
            }
            else {
                console.log("No products Found", products);
                console.log("Completed");
                moreItems = false;
                break;
            }

            console.log(`==================== ${pages} ===================`);
        }
      return "Completed";
    } catch (error) {
       throw error;
    }
};

main()
    .then(success => console.log(success))
    .catch(error => console.log(error));
