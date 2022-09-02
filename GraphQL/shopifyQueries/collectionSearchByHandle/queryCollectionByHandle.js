const collectionSearchByHandle = `
  query collectionSearchByHandle($title: String!) {
    collectionByHandle(handle: $title) {
      id
      handle
    }
  }
`;
