[orderCapture](https://shopify.dev/api/admin-graphql/2022-07/mutations/orderCapture)

To capture payment on an order that is `authorized`, a `OrderTransaction` id is required. `OrderTransaction` is property that can be found on the order object via graphQL
`get-order-transaction-id.http`

After getting the id successfully, we can capture payment. `capture-payment.http`

Payment failure:
`capture-payment_failed.http` is an example of a payment failure.
Where `userErrors` will be an array with a length, containing reason(s) of the failure.

Notes:

- You can't more than the `totalUnsettledSet` amount. The `totalUnsettledSet` is the reserved amount from the initial authorization or whatever is left on the authorization. 
- `kind` will move from `"AUTHORIZATION"` to `"CAPTURE"` on success
- `totalUnsettledSet` will go to `0.0` when there is nothing left to capture
