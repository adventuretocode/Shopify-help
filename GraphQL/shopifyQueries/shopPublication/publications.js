const listAllPublication = `
query listAllPublication {
  publications(first: 50) {
    edges {
      node {
        id
        name
        supportsFuturePublishing
        app {
          id
          title
          developerName
          handle
          title
          
        }
      }
    }
  }
}
`;

const rtnListAllPublication = {
  "data": {
    "publications": {
      "edges": [
        {
          "node": {
            "id": "gid://shopify/Publication/27298857049",
            "name": "Online Store",
            "supportsFuturePublishing": true,
            "app": {
              "id": "gid://shopify/App/580111",
              "title": "Online Store",
              "developerName": "Shopify",
              "handle": "online_store"
            }
          }
        }
      ]
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 102,
      "actualQueryCost": 4,
      "throttleStatus": {
        "maximumAvailable": 2000,
        "currentlyAvailable": 1996,
        "restoreRate": 100
      }
    }
  }
}
