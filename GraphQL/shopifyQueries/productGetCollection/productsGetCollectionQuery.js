const query = `
query productSearchForODAD($num: Int!, $curser: String!) {
  products(first: $num, after: $curser) {
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