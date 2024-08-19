const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to User
  episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Episode" }],
},{timestamps:true
});

module.exports = mongoose.model("Project", ProjectSchema);