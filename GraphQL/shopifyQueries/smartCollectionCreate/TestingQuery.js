const realTestQuery =  `
mutation createSmartCollection($input: CollectionInput!, $num: Int!) {
  collectionCreate(input: $input) {
    collection {
      id
      products(first: $num) {
        edges {
          node {
            id
            handle
            publishedAt
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;
