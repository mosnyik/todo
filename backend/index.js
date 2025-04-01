const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Mosnyik ToDos<h1>");
});

app.get("/tasks", (req, res) => {
  res.send({
    id: 1,
    task: {
      title: "Taks Title",
      body: "task body",
    },
    priority: 1,
    dueDate: Date.now(),
  });
});


app.post("/tasks", (req, res)=>{
  res.send("Task deleted")
} )

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`ToDo app up and running on port ${port}...`));
