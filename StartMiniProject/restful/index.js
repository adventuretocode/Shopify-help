require("../../../config");
const { NODE_ENV, SHOP } = process.env;
const path = require("path");
const createFileIfNotExist = require("../../helpers/createFileIfNotExist");
const jsonLastKeyAndValue = require("../../helpers/jsonLastKeyAndValue");
const program = require("./main");

const nextPageFileName = `./next-${NODE_ENV}-${SHOP}.json`;

const main = async () => {
  try {
    await createFileIfNotExist(path.join(__dirname, nextPageFileName));
    const cursorJson = require(nextPageFileName);

    const {
      lastKey: loopStartAt,
      lastValue: cursorStartAt,
    } = jsonLastKeyAndValue(cursorJson);

    const result = await program(cursorStartAt, loopStartAt, 5);
    return result;
  } catch (error) {
    throw error;
  }
};

main()
  .then((results) => {
    console.log(results);
    process.exit();
  })
  .catch((error) => {
    console.log("Error: Main - ", error);
    process.exit();
  });
