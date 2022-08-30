import dotenv from 'dotenv';

dotenv.config();

import ORM from './db/orm.js';

const main = async () => {
	try {
		const result = await ORM.selectAll("prices_from_cart");
		console.log(result);
	} catch (error) {
		console.log("Error: ", error);
	}
}

main();
