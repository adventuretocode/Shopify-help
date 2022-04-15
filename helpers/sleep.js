/**
 * Pause async execution
 *
 * @param {Number} num Amount of time in milliseconds
 */
module.exports = (num) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, num);
  });
};
