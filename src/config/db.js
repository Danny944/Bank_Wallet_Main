import pg from "pg";
const { Client } = pg;

const client = new Client({
  host: "host",
  port: 5432,
  database: "Bank-Wallet",
  user: "postgres",
  password: "password",
});

client.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

export default client;
