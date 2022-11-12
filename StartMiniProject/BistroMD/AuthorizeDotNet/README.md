# Steps Test Migrated Customers

### Create the customer(s) on the sandbox
1. Visit [Authorize.net API](https://developer.authorize.net/api/reference/index.html)
2. Open the drop down to add in sandbox API keys
   1. The dropdown is closed by default and starts with `FIRST TIME USER?`
3. Scroll down to `ENTER SANDBOX CREDENTIALS`
4. Enter the `API Login ID` and `Transaction Key`
   1. NOTE: Only sandbox keys will work here. Production keys will just fail
5. Click on `Populate Sample Requests`
6. All the info should populate for each API reference
```json
"merchantAuthentication": {
  "name": "SANDBOX_ID",
  "transactionKey": "SANDBOX_KEY"
},
```
7. On the left hand navigation items find `Customer Profiles` and open it
8. The topic should open up, find `Create Customer Payment Profile`
9. Optional: You can update the profile with the a customer you would like to test with
  ```json
  ...
    "billTo": {
  ...
    "payment": {
  ```
   1.  I would so that you can keep track of which customer to which, but overall it doesn't matter
   2.  `"billTo": {` and `"payment": {`
10. Hit `send` to create the profile.
11. It should be successful in the response
```json
"messages": {
  "resultCode": "Ok",
  "message": [
    {
      "code": "I00001",
      "text": "Successful."
    }
  ]
}
```
12. Write down the customer `customerProfileId` and the `customerPaymentProfileIdList` id. These are the numbers we'll need to input into Recharge
```json
  "customerProfileId": "507826548",
  "customerPaymentProfileIdList": [
    "512514205"
  ],
```
13. Get the example CSV 
14. Select environment store
15. Fill in CSV with correct customer test data for the specific store
16. Go into the recharge app for the specific store
      Recharge > Apps > Bulk Actions by Recharge
17. Then upload the CSV
18. Hit `Validate`
19. Warnings are okay. Errors not okay and need to be handled
20. After errors are cleared.
21. Hit process
22. Go to the customer to see if the customer exist
23. Process the order
24. Follow steps to capture payment via api to see a full circle