// Note I node v18+
const { createCustomerProfile } = require("./create-customer-profile-with-payment.cjs");

const customer = {
  email: "john@chelseaandrachel.com",
  firstName: "John",
  lastName: "Walmart",
  address: "11822 Gilbert St",
  city: "Garden Grove",
  state: "CA",
  zipCode: "92841",
  country: "United Sate",
  phone: "714-591-1300",
  cardNumber: "4242424242424242",
  expDate: "1226",
};

createCustomerProfile(function () {
  console.log("createCustomerProfile call complete.");
}, customer);
