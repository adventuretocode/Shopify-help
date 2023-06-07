import { DataTypes } from "sequelize";
import conn from "../config/connection.js";

const File = conn.sq.define('File', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  old_gid: {
    type: DataTypes.STRING,
  },
  new_gid: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.TEXT,
  },
  alt: {
    type: DataTypes.TEXT,
  },
  name: {
    type: DataTypes.STRING,
  },
  created_on_dev_store: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

export { File };
