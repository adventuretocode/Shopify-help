const collectionsByHandleAndGetProducts = `
query searchCollectionsByHandleAndGetProducts($num: Int!, $title: String!) {
  collectionByHandle(handle: $title) {
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
`;
