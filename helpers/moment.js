const moment = require("moment");

// A set time
console.log(moment("12-25-1995", "MM-DD-YYYY").format());
// Now
console.log(moment().format());
