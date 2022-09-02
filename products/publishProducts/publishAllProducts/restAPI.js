/**
 * Make One product live
 */

require("../../config");
const getAllProducts = require("../../helpers/getAllProducts.js");
const apiPutRequest = require("../../helpers/apiPutRequest.js");
const fsWriteFile = require("../../helpers/fsWriteFile");
const path = require("path");

const { SHOP, ACCESS_TOKEN } = process.env;


const buildShopifyBody = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/products/${id}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: {
          product: {
            id: id,
            // true to publish and false hide
            published: true
          }
        }
      };

      const { product } = await apiPutRequest(options);
        resolve(product);
    } catch (error) {
      reject(error);
    }
  });
};

const processProductsToPublished = function(products) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < products.length; i+=1) {
        const { id: productId, title: productTitle , published_at } = products[i];
        if(!published_at) {
          const { id, title } = await buildShopifyBody(productId);
          console.log(`\u001b[38;5;${id % 255}m${title}\u001b[0m`);
        }
        else {
          console.log("Already Published: ", `\u001b[38;5;${productId % 255}m${productTitle}\u001b[0m`);
        }
      }

      resolve("next");
    } catch (error) {
      reject(error);
    }
  });
}

const main = async function() {
  try {
    const continuePage = require("./page.json");
    let pages = continuePage.page || 1;
    let moreItems = true;
    let debug = false;

    while (moreItems) {
      const shopifyProducts = await getAllProducts(SHOP, ACCESS_TOKEN, 250, pages);

      if(!shopifyProducts) {
        console.log("Product is null");
        continue;
      }

      const { products } = shopifyProducts;

      if(products.length) {
        await processProductsToPublished(products);
        pages += 1;
      } 
      else {
        //Finished pagination of all products on shopify
        console.log("No products Found", products);
        moreItems = false;
        break;
      }

      //Debug
      if(debug) {
        if(pages > 1) {
          return "Debug";
        }
      }

      console.log(`==================== ${pages} ===================`);
      fsWriteFile(path.join(__dirname, `./page.json`), { page: pages});

    }
    return "Completed";
  } catch (error) {
    throw error;
  }
};

main()
  .then(data => console.log("Success: ", data))
  .catch(error => { 
    console.log("Errors: Main - ", error);

    // Timed out error code can still continue
    if(error.code === "ETIMEDOUT") {
      //code: 'ETIMEDOUT'
      setTimeout(() => {
        main();
      }, 1000);
    }
  });
