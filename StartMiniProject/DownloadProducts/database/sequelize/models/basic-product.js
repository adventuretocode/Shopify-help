import { DataTypes } from "sequelize";
import conn from "../config/connection.js";

const BasicProduct = conn.sq.define('Basic_Product', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  data: {
    type: DataTypes.JSON,
  },
  created_on_dev_store: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

export { BasicProduct };
