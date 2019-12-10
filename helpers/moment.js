const moment = require("moment");
const momentTimeZone = require("moment-timezone");

// A set time
// console.log(moment("12-25-1995", "MM-DD-YYYY").format());
// Now
// console.log(moment().format());


const today = momentTimeZone().tz('America/New_York').format("YYYY-MM-DD");
const yesterday = moment(today, "YYYY-MM-DD").subtract(1, 'days').format("YYYY-MM-DD");
console.log(yesterday);