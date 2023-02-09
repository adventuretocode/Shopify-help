const request = require("request");

/**
 * Get request to shopify
 *
 * @param   {Object} option          The request object for shopify
 * @param   {String} option.url      The url of endpoint
 * @param   {String} option.headers  Header containing access token "X-Shopify-Access-Token"
 * @param   {String} option.method   HTTP request GET POST DELETE PUT
 * @param   {Number} timeOut         Time before the next execution can start
 * @returns {Promise<{}>}      Promise object represents the post body
 */

const restApiService = function (option, timeOut = 250) {
  return new Promise(function (resolve, reject) {
      option.json = true;
      request(option, function (err, resp, body) {
          if (err) {
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
            }, timeOut);
          }
      });
  });
};

module.exports = restApiService;
