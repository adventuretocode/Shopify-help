// Get Fulfillment ID `FulfillmentOrder` and `FulfillmentOrderLineItem` 
`
query getOrderByID($id: ID!) {
  order(id: $id) {
    id
    name
    fulfillmentOrders(first: 10) {
      edges {
        node {
          id
          status
          requestStatus
          supportedActions {
            action
          }
          lineItems(first: 10) {
            edges{
              node {
                id
              }
            }
          }
        }
      }
    }
  }
}
`