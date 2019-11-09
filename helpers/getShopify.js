const request = require("request");

/**
 * Get request to shopify
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const getShopify = function (option) {

  return new Promise(function (resolve, reject) {
      request.get(option, function (err, res, body) {
          if (err) {
              reject(err);
          }

          setTimeout(() => {
              resolve(body);
          }, 250);
      });
  });
};

module.exports = getShopify;
