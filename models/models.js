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

exports.userTojson = (user, isLog = false) => {
  return isLog
    ? {
        id: user._id.toString(),
        username: user.username,
        count: user.count,
        log: user.log,
      }
    : { username: user.username, _id: user._id.toString() };
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
