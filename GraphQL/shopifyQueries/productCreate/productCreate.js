const productCreate = `
mutation productCreate($input: ProductInput!) {
  productCreate(input: $input) {
    product {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;
