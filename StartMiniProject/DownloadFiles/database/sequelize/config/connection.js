import { Sequelize } from "sequelize";

const { PG_DATABASE, PG_PASSWORD, PG_USERNAME } = process.env;

// Connection parameters
const sequelize = new Sequelize(PG_DATABASE, PG_USERNAME, PG_PASSWORD, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default {
  sq: sequelize,
  testDbConnection,
};
