const straightProductSearchById = `
query {
  product(id: "gid://shopify/Product/4374205562979") {
    id
    handle
    productType
    variants(first: 5) {
      edges {
        node {
          id
        }
      }
    }
  }
}
`;

const productSearchById = `
query productSearchById($gid: ID!) {
  product(id: $gid) {
    id
    handle
    productType
    variants(first: 5) {
      edges {
        node {
          id
        }
      }
    }
  }
}
`
