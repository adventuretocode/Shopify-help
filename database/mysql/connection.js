import { createConnection } from "mysql";

const { DB_USER, DB_HOST, DB_PASSWORD, DB_DATABASE } = process.env;

const connection = createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

export const checkConnection = () => {
  connection.connect((err) => {
    if (err) throw err;
    console.log("You are connected to thread #" + connection.threadId);
    process.exit();
  });
}

export default connection;
