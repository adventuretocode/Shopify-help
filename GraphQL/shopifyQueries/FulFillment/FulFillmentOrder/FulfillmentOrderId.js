// This was to get the inventory item of the variants
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
          destination {
            address1
            address2
            city
            countryCode
            email
            firstName
            lastName
            phone
            province
            zip
          }
          lineItems(first: 1) {
            edges {
              node {
                id
                totalQuantity
                remainingQuantity
                lineItem {
                  variant {
                    inventoryItem {
                      id
                    }
                  }
                }
              }
            }
          }
          assignedLocation {
            name
            location {
              address {
                address1
                address2
                city
                countryCode
                phone
                province
                zip
              }
              id
            }
          }
          merchantRequests(first: 1){
            edges {
              node {
                message
              }
            }
          }
        }
      }
    }
  }
}
`