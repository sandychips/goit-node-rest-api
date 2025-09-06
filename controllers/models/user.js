import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const User = sequelize.define(
  "user",
  {
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    subscription: {
      type: DataTypes.ENUM,
      values: ["starter", "pro", "business"],
      defaultValue: "starter",
    },
    token: { type: DataTypes.STRING, defaultValue: null },
  },
  { tableName: "users", timestamps: true }
);

export default User;
