const publishProductToWeb = `
mutation publishProductToWeb($product_id: ID!, $input: PublicationInput!) {
  publishablePublish(id: $product_id, input: [$input]) {
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
    "publishablePublish": {
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
};
