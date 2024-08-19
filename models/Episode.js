const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
},{timestamps:true});

module.exports = mongoose.model('Episode', EpisodeSchema);