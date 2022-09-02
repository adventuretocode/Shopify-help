
// Convert Shopify date into MariaDb date
// 2020-02-28T23:09:18Z => 2020-04-28 14:39:26
const convertDate = function(string) {
  if(string.length > 23) {
    const shopifyDateTime = string.replace("T", " ").replace("Z", "").split("-");
    shopifyDateTime.pop();
    const mariaDBDateTime = shopifyDateTime.join("-");
    return mariaDBDateTime;
  }
  else {
    return string.replace("T", " ").replace("Z", "");
  }
}

/**
 * @description Clean shopify date for database and shift time zone for east coast
 * @param  {String} shopifyDate Input string
 * @return {String} Valid date data type for MariaDb
 * @example
 * cleanArtistFileName("2020-05-13T05:08:59Z")
 * // 2020-5-13 00:10:02
 */
const cleanDate = (shopifyDate) => {
  const newYorkTime = new Date(shopifyDate)
    .toLocaleString("en-US", { hour12: false, timeZone: "America/New_York" });
  const [date, time] = newYorkTime.split(", ");
  const [month, day, year] = date.split("/");
  const mariaDBDate = [year, month, day].join("-");
  return [mariaDBDate, time].join(" ");
};

module.exports.convertDate = convertDate;
module.exports.cleanDate = cleanDate;
