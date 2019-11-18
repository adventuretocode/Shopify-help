const productDeleteInput = `
mutation productDelete($input: ProductDeleteInput!) {
  productDelete(input: $input) {
    deletedProductId
    shop {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;
