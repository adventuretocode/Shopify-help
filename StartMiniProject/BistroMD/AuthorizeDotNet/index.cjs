// Note I node v18+
const { createCustomerProfile } = require("./create-customer-profile-with-payment.cjs");

const customer = {
  email: "sam@chelseaandrachel.com",
  firstName: "Sam",
  lastName: "Walmart",
  address: "3600 W McFadden Ave",
  city: "Santa Ana",
  state: "CA",
  zipCode: "92704",
  country: "United Sate",
  phone: "714-775-1804",
  cardNumber: "4242424242424242",
  expDate: "1227",
};

createCustomerProfile(function () {
  console.log("createCustomerProfile call complete.");
}, customer);
