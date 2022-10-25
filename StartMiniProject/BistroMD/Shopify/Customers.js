import {
  buildOptions,
  buildGraphqlOptions,
  networkRequest,
  networkRequestGraphQL,
} from "./base.js";

const remove = async (customer_id) => {
  try {
    const options = buildOptions(`/customers/${customer_id}`, "DELETE");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Network Request Error");
  }
};

const findCustomerByEmailWithOrder = async (email) => {
  try {
    const query = `
			query findCustomerByEmail($query: String!) {
				customers(query: $query, first: 1) {
					edges {
						node{
							id
							orders(first: 50) {
								edges {
									cursor
									node{
										id
									}
								}
								pageInfo {
									hasNextPage
								} 
							}
						}
					}
				}
			}
		`;

    const input = {
      query: email,
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteCustomerGraphQL = async (gid) => {
  try {
    const query = `
			mutation deleteCustomer($input: CustomerDeleteInput!) {
				customerDelete(input: $input) {
					deletedCustomerId
					userErrors {
						field
						message
					}
				}
			}
		`;

    const input = {
      input: {
        id: gid,
      },
    };

		const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
		return result;
  } catch (error) {
		throw error;
	}
};

const Customers = {
  remove,
  // GraphQL
  findCustomerByEmailWithOrder,
	deleteCustomerGraphQL,
};

export default Customers;
