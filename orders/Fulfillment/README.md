Fulfillment isn't a whole order. But rather groups of items in an order. 

There are 3 levels to consider
Order => FulfillmentOrder => FulfillmentOrderLineItem

The order is used to get the other 2 information FulfillmentOrder and FulfillmentOrderLineItem

The 2 other levels:
- `gid://shopify/FulfillmentOrder/<NUMBER>`
- `gid://shopify/FulfillmentOrderLineItem/<NUMBER>`

`gid://shopify/FulfillmentOrder/<NUMBER>` is not the same as the `gid://shopify/Order/<NUMBER>`

FulfillmentOrder is a group of items in an order. There could be as little as `1` FulfillmentOrder an in order and no max. Where `1` lineItem could go back and fourth between fulfilled and unfulfilled.

 1. Use the order ID to get both `FulfillmentOrder` and `FulfillmentOrderLineItem`
 File: `get-fulfillment-id.http`
 2. Get `FulfillmentOrder` (the parent) and each `FulfillmentOrderLineItem` (the children or child)
 File: `fulfill-line-item.http`

Notes:

- Usually if the `status` of `FulfillmentOrder` is `CLOSED` then most likely there will be no `supportedActions` and nothing to fulfill
-  `supportedActions` should list `"CREATE_FULFILLMENT"` as one of the actions. Or else the `FulfillmentOrder` group is not fulfillable.
-  Use `remainingQuantity` to determine the `quantity` to fulfill per line item

There are 3 things to check to see if a line item is ready for fulfillment
`status` => `supportedActions` => `remainingQuantity`
1. `status` is not `"CLOSED"`
2. `supportedActions` contain `"CREATE_FULFILLMENT"`
3. `remainingQuantity` is greater than `0`
  