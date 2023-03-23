require("dotenv").config();

const express = require("express");
const verifyAuthentication = require("./middleware/verifyAuthentication");
const app = express();
const cors = require("cors");
const routes = require("./router/routes");
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(routes);
app.listen(port);

module.exports = app;
