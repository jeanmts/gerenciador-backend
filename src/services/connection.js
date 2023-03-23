const { Pool } = require("pg");

const pool = new Pool({
  user: "USER",
  host: "HOST",
  database: "DATABASE",
  password: "PASSWORD",
  port: "PORTPOOL",
});
module.exports = pool;
