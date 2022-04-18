
/**
 * Give the console a little color
 *
 * @param {Number} num Any number so the color bits can show normally an ID
 * @param {String} txt String to console to the terminal
 */
export default (num, msg) => {
  console.log(`\u001b[38;5;${num % 255}m${msg}\u001b[0m`);
};
