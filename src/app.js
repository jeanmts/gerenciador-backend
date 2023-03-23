require("dotenv").config();
const express = require("express");
const verifyAuthentication = require("./middleware/verifyAuthentication");
const app = express();
const routes = require("./router/routes");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(routes);
app.listen(port);

module.exports = app;
