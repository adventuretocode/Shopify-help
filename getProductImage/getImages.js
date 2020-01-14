require("dotenv").config();
const path = require("path");
const cleanData = require("../helpers/cleanData.js");
const apiGetRequest = require("../helpers/apiGetRequest.js");
const fsWriteFile = require("../helpers/fsWriteFile.js");

const mongojs = require("mongojs");
var db = mongojs("teefury", ["product_images"]);

/**
 * Query the admin to get all products but limit amount received
 *
 * @param   {Number} limit The amount requested from shopify 
 * @param   {Number} page  Paginate through Shopify's items on its server 
 * @returns {Promise}      Promise object represents the post body
 */

const getProducts = function(limit = 10, page = 1) {
  return new Promise(async function(resolve, reject) {
      const params = {
          url: `https://${process.env.SHOP}.myshopify.com/admin/products.json?limit=${limit}&page=${page}`,
          headers: {
            "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
          json: true,
      };
      
      try {
          const products = await apiGetRequest(params);
          resolve(products);
      } catch (error) {
          reject(error);
      }
  });
};

const saveIntoMongo = function(row) {
  return new Promise(function(resolve, reject) {
    db.product_images.insert(row, function(error, saved) {
      if (error) {
        reject(error);
      }
      else {
        resolve();
      }
    });
  });
}

const extractPhotos = function(product) {
  return new Promise(async function(resolve, reject){
    try {
      for(let i = 0; i < product.length; i+=1) {
        if(product[i].template_suffix === "2019-pdp") {
          const { id, title, handle, images } = product[i];
          
          const imageRow = {
            id: id,
            title: title,
            handle: handle,
          }

          if(images.length > 1) {
            imageRow["is_missing_image"] = false;
            images.forEach(function(image, i) {
              imageRow["image"+i] = image.src;
            });
          }
          else {
            imageRow["is_missing_image"] = true;
          }
          
          await saveIntoMongo(imageRow);
          console.log(`\u001b[38;5;${id % 255}m${title}\u001b[0m`);
        }
        else {
          continue;
        }
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


const main = async function() {
  try {
    
    let pages = 1;
    let moreItems = true;
    
    while (moreItems) {
        const shopifyProducts = await getProducts(250, pages);
        if(!shopifyProducts) {
            moreItems = false;
            throw "Products is null"
        };

        const { products } = shopifyProducts;
        
        // if(pages > 2) {
        //   moreItems = false;
        //   break;
        // }

        if(products.length) {
            await extractPhotos(products);
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
}

main()
  .then(results => { 
      console.log(results);
      process.exit();
  })
  .catch(error => console.log("Error: Main - ",error));

