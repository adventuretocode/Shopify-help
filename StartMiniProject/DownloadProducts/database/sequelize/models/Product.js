import { DataTypes } from "sequelize";
import conn from "../config/connection.js";

const Product = conn.sq.define('Product', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
  },
  body_html: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vendor: {
    type: DataTypes.STRING,
  },
  product_type: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  handle: {
    type: DataTypes.STRING,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  template_suffix: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
  },
  published_scope: {
    type: DataTypes.STRING,
  },
  tags: {
    type: DataTypes.TEXT,
  },
  admin_graphql_api_id: {
    type: DataTypes.STRING,
  },
  created_on_dev_store: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

const Variant = conn.sq.define("Variant", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  product_id: DataTypes.BIGINT,
  title: DataTypes.STRING,
  price: DataTypes.DECIMAL(10, 2),
  sku: DataTypes.STRING,
  position: DataTypes.INTEGER,
  inventory_policy: DataTypes.STRING,
  compare_at_price: DataTypes.DECIMAL(10, 2),
  fulfillment_service: DataTypes.STRING,
  inventory_management: DataTypes.STRING,
  option1: DataTypes.STRING,
  option2: DataTypes.STRING,
  option3: DataTypes.STRING,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
  taxable: DataTypes.BOOLEAN,
  barcode: DataTypes.STRING,
  grams: DataTypes.INTEGER,
  image_id: DataTypes.BIGINT,
  weight: DataTypes.FLOAT,
  weight_unit: DataTypes.STRING,
  inventory_item_id: DataTypes.BIGINT,
  inventory_quantity: DataTypes.INTEGER,
  old_inventory_quantity: DataTypes.INTEGER,
  requires_shipping: DataTypes.BOOLEAN,
  admin_graphql_api_id: DataTypes.STRING,
});

const Option = conn.sq.define("Option", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  product_id: DataTypes.BIGINT,
  name: DataTypes.STRING,
  position: DataTypes.INTEGER,
  value: DataTypes.ARRAY(DataTypes.STRING),
});

Product.hasMany(Variant, { foreignKey: "product_id" });
Variant.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(Option, { foreignKey: "product_id" });
Option.belongsTo(Product, { foreignKey: "product_id" });


export { Product, Variant, Option };
