/**
 * Pause async execution
 *
 * @param {Number} num Amount of time in milliseconds
 */
export default (num) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, num);
  });
};
