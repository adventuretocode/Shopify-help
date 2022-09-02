const UnpublishProductFromWeb = `
mutation UnpublishProductFromWeb($product_id: ID!, $input: PublicationInput!) {
  publishableUnpublish(id: $product_id, input: [$input]) {
		shop {
      name
    }
    userErrors {
      field
      message
    }
  }
}
`;

const returnData = {
  "data": {
    "publishableUnpublish": {
      "shop": {
        "name": "staging-teefury"
      },
      "userErrors": []
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 10,
      "actualQueryCost": 10,
      "throttleStatus": {
        "maximumAvailable": 2000,
        "currentlyAvailable": 1990,
        "restoreRate": 100
      }
    }
  }
}
