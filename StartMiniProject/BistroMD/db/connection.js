// Exported old legacy, but we need to stich together new
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config({path: "./.env.dev"});

const { DB_USER, DB_HOST, DB_PASSWORD, DB_DATABASE } = process.env;

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

function checkConnection() {
  connection.connect(function (err) {
    if (err) throw err;
    console.log("You are connected to thread #" + connection.threadId);
    process.exit();
  });
}

export default connection;
