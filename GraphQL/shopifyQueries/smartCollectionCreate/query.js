const createSmartCollection = `
  mutation createSmartCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;
