'use strict';

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var dotenv = require('dotenv');

const BISTRO_ENV = "dev";
dotenv.config({ path: `./.env.${BISTRO_ENV}` });

const { AUTH_NET_API_LOGIN_KEY, AUTH_NET_TRANSACTION_KEY, AUTH_NET_API_ENDPOINT } = process.env;

function getCustomerProfile(customerProfileId, callback) {

  var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(AUTH_NET_API_LOGIN_KEY);
  merchantAuthenticationType.setTransactionKey(AUTH_NET_TRANSACTION_KEY);

  var getRequest = new ApiContracts.GetCustomerProfileRequest();
  getRequest.setCustomerProfileId(customerProfileId);
  getRequest.setMerchantAuthentication(merchantAuthenticationType);

  //pretty print request
  console.log(JSON.stringify(getRequest.getJSON(), null, 2));
    
  var ctrl = new ApiControllers.GetCustomerProfileController(getRequest.getJSON());

  // ctrl.setEnvironment("https://apitest.authorize.net/xml/v1/request.api");
  // ctrl.setEnvironment("https://api.authorize.net/xml/v1/request.api");
  ctrl.setEnvironment(AUTH_NET_API_ENDPOINT);

  ctrl.execute(function(){

    var apiResponse = ctrl.getResponse();

    var response = new ApiContracts.GetCustomerProfileResponse(apiResponse);

    //pretty print response
    console.log(JSON.stringify(response, null, 2));

    if(response != null) 
    {
      if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
      {
        console.log('Customer profile ID : ' + response.getProfile().getCustomerProfileId());
        console.log('Customer Email : ' + response.getProfile().getEmail());
        console.log('Description : ' + response.getProfile().getDescription());
      }
      else
      {
        //console.log('Result Code: ' + response.getMessages().getResultCode());
        console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
        console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
      }
    }
    else
    {
      console.log('Null response received');
    }

    callback(response);
  });
}

if (require.main === module) {
  // Dev
  // getCustomerProfile('507536283', function(){
  // 	console.log('getCustomerProfile call complete.');
  // });

  // Prod Sean
  // getCustomerProfile('936819103', function(){
  // 	console.log('getCustomerProfile call complete.');
  // });
}

module.exports.getCustomerProfile = getCustomerProfile;
