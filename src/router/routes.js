const express = require("express");
const routes = express();
const controller = require("../controller/users/users");
const verifyAuthentication = require("../middleware/verifyAuthentication");

routes.get("/main", verifyAuthentication, controller.listTasks);
routes.post("/sign-up", controller.addUser);
routes.post("/sign-in", controller.loginUser);
routes.post("/main", verifyAuthentication, controller.addTasks);
routes.delete("/main/:id", verifyAuthentication, controller.deleteTask);

module.exports = routes;
