const request = require("request");

/**
 * Get request 
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const getRequest = function (option) {

  return new Promise(function (resolve, reject) {
      option.json = true;
      request.get(option, function (err, res, body) {
          if (err) {
              reject(err);
          }
          if(body.errors) {
            reject(body);
          }
          else {
            setTimeout(() => {
              resolve(body);
            }, 250);
          }
      });
  });
};

module.exports = getRequest;
