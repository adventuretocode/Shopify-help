
/**
 * Return clean id from shopify's GID
 */
export default (gid) => {
  const splitString = gid.split("/");
  return parseInt(splitString[splitString.length - 1]);
}
