const error = require("./middleware/error");
const express = require("express");
const app = express();
const homeRoute = require('./routes/index')
const taskRoute = require("./routes/todo");

app.use(express.json());
app.use("/api/", homeRoute)
app.use("/api/tasks", taskRoute)

app.use(error);

module.exports = app;
