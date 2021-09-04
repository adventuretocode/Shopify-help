// Closing an order Archives that order
`
mutation orderClose($input: OrderCloseInput!) {
	orderClose(input: $input) {
	 order {
		 id
	 }
	 userErrors {
		 message
	 }
 }
}
`
