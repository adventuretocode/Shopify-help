const productSearchByTag = `
query productSearchForODAD($num: Int!, $query: String!) {
  products(first: $num, query: $query) {
    edges {
      node {
        id
        handle
        title
      }
    }
  }
}
`;
