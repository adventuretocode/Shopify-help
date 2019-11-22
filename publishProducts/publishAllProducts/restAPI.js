/**
 * Make One product live
 */

const getAllProducts = require("../../helpers/getAllProducts.js");
require("../../config");
const { SHOP, ACCESS_TOKEN } = process.env;


const buildShopifyBody = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/products/${id}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        body: {
          product: {
            id: id,
            // true to publish and false hide
            published: true
          }
        }
      };

      const { product } = await getProducts(options);
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
        console.log("Already Published: ", `\u001b[38;5;${productId % 255}m${productTitle}\u001b[0m`);
      }

      resolve("next");
    } catch (error) {
      reject(error);
    }
  });
}

const main = async function() {
  try {
    let pages = 1;
    let moreItems = true;
    let debug = true;

    while (moreItems) {
      const shopifyProducts = await getAllProducts(SHOP, ACCESS_TOKEN, 10, pages);

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
        console.log("No products Found", products);
        moreItems = false;
        break;
      }

      //Debug
      if(debug) {
        if(pages > 1) {
          return;
        }
      }

      console.log(`==================== ${pages} ===================`);
    }
    return "Completed";
  } catch (error) {
    throw error;
  }
};

main()
  .then(data => console.log("Success: ", data))
  .catch(error => console.log("Errors: Main - ", error));
