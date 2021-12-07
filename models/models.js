const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  username: String,
  count: { type: String, default: 0 },
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});
const User = mongoose.model("user", UserSchema);

exports.userTojson = (user, isLog) => {
  switch (isLog) {
    case "FILTERED":
      return {
        id: user._id.toString(),
        username: user.username,
        from: user.from,
        to: user.to,
        count: user.count,
        log: user.log,
      };
    case "LOGS": {
      return {
        id: user._id.toString(),
        username: user.username,
        count: user.count,
        log: user.log,
      };
    }
    default: {
      return {
        id: user._id.toString(),
        username: user.username,
      };
    }
  }
};

exports.filterLog = (limit, from, to, user) => {
  user.from = "";
  user.to = "";
  if (!isNaN(from) && !isNaN(to)) {
    if (to >= from) {
      const newLog = [];
      let newCount = 0;
      for (let index = 0; index < user.log.length; index++) {
        const exercise = user.log[index];
        const date = new Date(exercise.date);
        if (date >= from && date <= to) {
          newCount++;
          newLog.push(exercise);
        }
      }
      user.log = newLog;
      user.count = newCount;
      user.from = from.toDateString();
      user.to = to.toDateString();
    }
  }
  if (!isNaN(limit) && limit > 0) {
    const newLog = [];
    let newCount = 0;
    const min = limit > user.log.length ? user.log.length : limit;
    for (let index = 0; index < min; index++) {
      const exercise = user.log[index];
      newLog.push(exercise);
      newCount++;
    }
    user.log = newLog;
    user.count = newCount;
  }
  return user;
};
exports.getUser = async (id) => {
  var query = { _id: id };
  return await User.findOne(query);
};

exports.getAllUsers = async () => {
  return await User.find();
};

exports.addNewUser = async (username) => {
  const user = new User({
    username: username,
    log: [],
  });

  await user.save();
  return this.userTojson(user);
};

exports.addNewExercise = async (id, description, duration, date) => {
  // Query the user
  const user = await this.getUser(id);
  // Increase the counter
  user.count++;
  // Push new exercise to the array
  const newExercise = {
    description: description,
    duration: duration,
    date: date,
  };
  user.log.push(newExercise);
  await user.save();
  return {
    _id: id,
    username: user.username,
    description: description,
    duration: duration,
    date: date,
  };
};
