
// Convert Shopify date into MariaDb date
// 2020-02-28T23:09:18Z => 2020-04-28 14:39:26
const convertDate = function(string) {
  return string.replace("T", " ").replace("Z", "");;
}

module.exports = convertDate;