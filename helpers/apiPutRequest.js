const request = require("request");

/**
 * Get request to shopify
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const putRequest = function (option) {

  return new Promise(function (resolve, reject) {
      option.json = true;
      request.put(option, function (err, res, body) {
          if (err) {
              reject(err);
          }
          if(res && res.statusCode >= 300) {
            console.log(res.statusMessage);
            reject(body);
          }
          if (body && body.hasOwnProperty("error")) {
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

module.exports = putRequest;
