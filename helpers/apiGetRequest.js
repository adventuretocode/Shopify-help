const request = require("request");

/**
 * Get request
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const getRequest = function(option) {
  return new Promise(function(resolve, reject) {
    option.json = true;
    request.get(option, function(err, resp, body) {
      if (err) {
        console.log("Request Error");
        reject(err);
      }
      if(resp && resp.statusCode >= 300) {
        console.log(resp.statusMessage);
        reject(body);
      }
      if (body && body.hasOwnProperty("error")) {
        reject(body);
      }
      else {
        setTimeout(() => {
          resolve(resp);
        }, 250);
      }
    });
  });
};

module.exports = getRequest;
