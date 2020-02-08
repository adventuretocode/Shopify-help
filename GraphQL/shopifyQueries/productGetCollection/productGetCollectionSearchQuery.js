const some = `
query productsGetCollection($num: Int!, $query: String!) {
  products(first: $num, query: $query) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        handle
        publishedAt
        collections(first: 10) {
          edges {
            node {
              id
              handle
            }
          }
        }
      }
    }
  }
}
`;
