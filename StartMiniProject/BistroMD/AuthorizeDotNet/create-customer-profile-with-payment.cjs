"use strict";

var ApiContracts = require("authorizenet").APIContracts;
var ApiControllers = require("authorizenet").APIControllers;
var utils = require("./utils.cjs");

var dotenv = require("dotenv");

const BISTRO_ENV = "staging";
dotenv.config({ path: `./.env.${BISTRO_ENV}` });

const {
  AUTH_NET_API_LOGIN_KEY,
  AUTH_NET_TRANSACTION_KEY,
  AUTH_NET_API_ENDPOINT,
} = process.env;

function createCustomerProfile(callback, customer) {
  const {
    email,
    firstName,
    lastName,
    address,
    city,
    state,
    zipCode,
    country,
    phone,
    cardNumber,
    expDate,
  } = customer;

  var merchantAuthenticationType =
    new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(AUTH_NET_API_LOGIN_KEY);
  merchantAuthenticationType.setTransactionKey(AUTH_NET_TRANSACTION_KEY);

  var creditCard = new ApiContracts.CreditCardType();
  creditCard.setCardNumber(cardNumber);
  creditCard.setExpirationDate(expDate);

  var paymentType = new ApiContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  var customerAddress = new ApiContracts.CustomerAddressType();
  customerAddress.setFirstName(firstName);
  customerAddress.setLastName(lastName);
  customerAddress.setAddress(address);
  customerAddress.setCity(city);
  customerAddress.setState(state);
  customerAddress.setZip(zipCode);
  customerAddress.setCountry(country);
  customerAddress.setPhoneNumber(phone);

  var customerPaymentProfileType =
    new ApiContracts.CustomerPaymentProfileType();
  customerPaymentProfileType.setCustomerType(
    ApiContracts.CustomerTypeEnum.INDIVIDUAL
  );
  customerPaymentProfileType.setPayment(paymentType);
  customerPaymentProfileType.setBillTo(customerAddress);

  var paymentProfilesList = [];
  paymentProfilesList.push(customerPaymentProfileType);

  var customerProfileType = new ApiContracts.CustomerProfileType();
  customerProfileType.setMerchantCustomerId(
    "bistro_md_" + utils.getRandomString("cust_")
  );
  customerProfileType.setDescription("Profile description here");
  customerProfileType.setEmail(email);
  customerProfileType.setPaymentProfiles(paymentProfilesList);

  var createRequest = new ApiContracts.CreateCustomerProfileRequest();
  createRequest.setProfile(customerProfileType);
  createRequest.setValidationMode(ApiContracts.ValidationModeEnum.TESTMODE);
  createRequest.setMerchantAuthentication(merchantAuthenticationType);

  //pretty print request
  console.log(JSON.stringify(createRequest.getJSON(), null, 2));

  var ctrl = new ApiControllers.CreateCustomerProfileController(
    createRequest.getJSON()
  );

  ctrl.setEnvironment(AUTH_NET_API_ENDPOINT);

  ctrl.execute(function () {
    var apiResponse = ctrl.getResponse();

    var response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

    //pretty print response
    console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (
        response.getMessages().getResultCode() ==
        ApiContracts.MessageTypeEnum.OK
      ) {
        console.log(
          "Successfully created a customer profile with id: " +
            response.getCustomerProfileId()
        );
        console.log(
          "Successfully created a customer payment profile with ids: ",
          response.getCustomerPaymentProfileIdList()
        );
      } else {
        console.log("Result Code: " + response.getMessages().getResultCode());
        console.log(
          "Error Code: " + response.getMessages().getMessage()[0].getCode()
        );
        console.log(
          "Error message: " + response.getMessages().getMessage()[0].getText()
        );
      }
    } else {
      console.log("Null response received");
    }

    if(typeof callback === 'function') {
      callback(response);
    }
  });
}

// If file is ran directly, then the following will execute
// node create-customer-profile-with-payment
if (require.main === module) {
  const customer = {
    email: "bryan@chelseaandrachel.com",
    firstName: "bryan",
    lastName: "tran",
    address: "13331 Beach Blvd",
    city: "Westminster",
    state: "CA",
    zipCode: "92683",
    country: "United Sate",
    phone: "714-799-0020",
    cardNumber: "4242424242424242",
    expDate: "1225",
  };

  createCustomerProfile(function () {
    console.log("createCustomerProfile call complete.");
  }, customer);
}

module.exports.createCustomerProfile = createCustomerProfile;
