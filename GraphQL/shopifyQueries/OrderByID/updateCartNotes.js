`mutation orderNotes ($input: OrderInput!){
  orderUpdate(input: $input) {
    order{
      updatedAt
      customer {
        id
      }
    }
  }
}`;
