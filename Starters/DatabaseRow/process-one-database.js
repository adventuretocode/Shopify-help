import dotenv from "dotenv";

dotenv.config();

const DATABASE = "";

const processRowData = async (data) => {
  try {
    console.log(data);
		return "async";
  } catch (error) {
    throw error;
  }
}

const main = async () => {
  console.time();
  try {

    let query = `status = 'UPDATE' LIMIT 1`;
    const [record] = await ORM.findOne(DATABASE, query);

		if(!record) return "Completed";

    await processRowData(record);
     
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};

main()
  .then((success) => {
    console.log("==========================================");
    console.log(success);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  })
  .catch((err) => {
    console.log("==========================================");
    console.log(err);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  });
