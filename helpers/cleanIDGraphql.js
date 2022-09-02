/**
 * Return clean id from shopify's GID
 */
module.exports = function(gid) {
  const splitString = gid.split("/");
  return parseInt(splitString[splitString.length - 1]);
}
