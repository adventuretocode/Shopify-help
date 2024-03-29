import cleanIDGraphql from "./cleanIDGraphql.js";

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
  console.log(`\u001b[38;5;${num % 255}m${txt}\u001b[0m`);
};
