const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// connect mongo db
const connectMongo = async function () {
  await mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("connected database");
    }
  );
};
connectMongo().catch((err) => console.log(err));
const service = require("./models/models");
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app
  .route("/api/users")
  .get(async (req, res) => {
    const usersRaw = await service.getAllUsers();
    var users = [];
    for (let index = 0; index < usersRaw.length; index++) {
      const userRaw = usersRaw[index];
      users.push(service.userTojson(userRaw));
    }
    res.send(users);
  })
  .post(async (req, res) => {
    const newUser = await service.addNewUser(req.body.username);
    res.json(newUser);
  });

app.get("/api/users/:id/logs", async (req, res) => {
  const _id = req.params.id;
  if (_id === undefined) {
    res.json({ error: "_id is not defined !" });
    return;
  }
  const user = await service.getUser(_id);
  res.json(service.userTojson(user, true));
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  let _id, description, duration, dateString;
  _id = req.params._id;
  if (_id === undefined) {
    res.json({ error: "_id is not defined !" });
    return;
  }
  duration = Number(req.body.duration);
  description = req.body.description;

  if (!description) {
    description = "No";
  }
  if (isNaN(duration)) {
    duration = 10;
  }
  let date = new Date(req.body.date);
  if (isNaN(date)) {
    date = new Date();
  }
  dateString = date.toDateString();
  const result = await service.addNewExercise(
    _id,
    description,
    duration,
    dateString
  );
  res.json(result);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
