const cleanIDGraphql = (gid) => {
  const splitString = gid.split("/");
  return parseInt(splitString[splitString.length - 1]);
};

/**
 * Give the console a little color
 *
 * @param {Number} num Any number so the color bits can show normally an ID
 * @param {String} txt String to console to the terminal
 */
export default (num, txt) => {
  if (typeof num !== "number") {
    num = cleanIDGraphql(num);
  }
  return `\u001b[38;5;${num % 255}m${txt}\u001b[0m`;
};
