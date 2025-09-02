import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const {
  DATABASE_URL,
  PGHOST,
  PGPORT = 5432,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
} = process.env;

const connectionString =
  DATABASE_URL ??
  `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST ?? "localhost"}:${PGPORT}/${PGDATABASE}`;

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
});

export const initDb = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // створить таблиці, якщо їх немає
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

export default sequelize;
