/**
 * Get Last Key and Value of a Json
 *
 * @param  {JSON} json Well formed json object
 * @return {{lastKey:String|Number, lastValue}}
 */

const jsonLastKeyAndValue = (jsonObj) => {
  const keyArray = Object.keys(jsonObj);
  let lastKey = keyArray[keyArray.length - 1];
  const lastValue = jsonObj[lastKey];
  const keyParseNum = +lastKey;

  if (keyParseNum.toString() !== "NaN") {
    lastKey = keyParseNum;
  }

  return {
    lastKey,
    lastValue,
  };
};

module.exports = jsonLastKeyAndValue;
