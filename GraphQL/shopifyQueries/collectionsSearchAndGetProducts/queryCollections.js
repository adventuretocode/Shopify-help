const collectionsSearchAndGetProducts = `
query searchCollectionByTitle($num: Int!, $query: String!) {
  collections(first: 1, query: $query) {
    edges {
      node {
        id
        handle
        products(first: $num) {
          edges {
            node {
              handle
            }
          }
        }
      }
    }
  }
}
`;
