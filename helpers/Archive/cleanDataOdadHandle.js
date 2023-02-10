/**
 * Strip Odad from the beginning of the handle
 * 
 * @param  {String} handle Original odad handle
 * @return {String}        
 */

const cleanDataOdadHandle = function(handle) {
  const [ , ...splitHandle ] = handle.split("-");
  return splitHandle.join("-");
}

module.exports = cleanDataOdadHandle;
