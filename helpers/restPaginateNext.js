// `<https://teefury-com.myshopify.com/admin/api/2019-10/orders.json?limit=1&page_info=eyJkaXJlY3Rpb24iOiJwcmV2IiwibGFzdF9pZCI6MjE2ODA3MjU2ODg5OCwibGFzdF92YWx1ZSI6IjIwMjAtMDQtMjkgMTg6Mjc6MjAifQ>; rel="previous", <https://teefury-com.myshopify.com/admin/api/2019-10/orders.json?limit=1&page_info=eyJkaXJlY3Rpb24iOiJuZXh0IiwibGFzdF9pZCI6MjE2ODA3MjU2ODg5OCwibGFzdF92YWx1ZSI6IjIwMjAtMDQtMjkgMTg6Mjc6MjAifQ>; rel="next"`
// `<https://teefury-com.myshopify.com/admin/api/2019-10/orders.json?limit=1&page_info=eyJsYXN0X2lkIjoyMTY4MzY3MDg3NjgyLCJsYXN0X3ZhbHVlIjoiMjAyMC0wNC0yOSAyMDozMjoyMyIsImRpcmVjdGlvbiI6Im5leHQifQ>; rel="next"`

const extractNextPage = (link) => {
  if (link.includes("next")) {
    const liveLink = link.split(";");
    const pageInfo = liveLink[0].split("&page_info")
    const cleanPageInfo = pageInfo[1].replace(">", "");
    return cleanPageInfo;
  }
};

/**
 * Get whole header object
 * @param  {Object}       headers HTTP headers
 * @return {Promise<String|null>}          Return the next page_info or null for no more pages
 */

const restPaginateNext = (headers) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { link } = headers;
      const splitLink = link.split(",");
      const liveLink = splitLink[1]
        ? splitLink[1]
        : splitLink[0]
        ? splitLink[0]
        : null;
      if (liveLink) {
        resolve(extractNextPage(liveLink));
      } else {
        reject("No Live link in header");
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = restPaginateNext;
