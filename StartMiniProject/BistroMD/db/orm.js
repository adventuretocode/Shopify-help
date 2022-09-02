import connection from "./connection.js";

const ORM = {
  selectAll: (table) => {
    return new Promise((resolve, reject) => {
      var query = "SELECT * FROM ??";
      var mode = [table];
      connection.query(query, mode, function (err, data) {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
  insertOneObj: (table, colAndValObj) => {
    return new Promise((resolve, reject) => {
      var query = "INSERT INTO ?? SET ?";
      var mode = [table, colAndValObj];
      connection.query(query, mode, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
  insertOne: function (table, cols, value, cb) {
    var query = "INSERT INTO ??  (" + cols.toString() + ") VALUES (?)";
    var mode = [table, value];
    connection.query(query, mode, function (err, data) {
      if (err) throw err;
      cb(data);
    });
  },
  updateOne: (table, cols, value, condition) => {
    return new Promise((resolve, reject) => {
      var query = "UPDATE ?? SET " + cols.toString() + "=? WHERE " + condition;
      var mode = [table, value];
      connection.query(query, mode, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
  findOne: (table, condition) => {
    return new Promise((resolve, reject) => {
      var query = "SELECT * FROM ?? WHERE " + condition;
      var mode = [table];
      connection.query(query, mode, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
};

export default ORM;
