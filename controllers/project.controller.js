const Project = require("../models/Project");
const User = require("../models/User");
const Episode = require("../models/Episode");
const catchAsync = require("../utils/catchAsync");

// Create a Project
exports.createProject = catchAsync(async (req, res) => {
  const { title } = req.body;

  try {
    const project = new Project({ title, user: req.user._id });
    const savedProject = await project.save();

    req.user.projects.push(savedProject._id);
    await req.user.save(); // Save the user with the updated project array

    res.status(201).json(savedProject);
  } catch (err) {
    res.status(400).json({ message: "Failed to create project" });
  }
});

// Read all Projects for a User
exports.getProjects = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "projects",
      populate: { path: "episodes" },
    });

    res.json(user.projects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Update a Project
exports.updateProject = catchAsync(async (req, res) => {
  const { title } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    project.title = title;
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: "Failed to update project" });
  }
});

// Delete a Project
exports.deleteProject = catchAsync(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await project.remove();

    req.user.projects.pull(project._id); // Remove project from user's project array
    await req.user.save(); // Save user after removal

    res.json({ message: "Project removed" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete project" });
  }
});

// Add Episode to a Project
exports.addEpisode = catchAsync(async (req, res) => {
  const { title, content } = req.body;
  try {
    const project = await Project.findById(req.params.projectId);
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const episode = new Episode({
      title,
      content,
      project: req.params.projectId,
    });
    const savedEpisode = await episode.save();
    project.episodes.push(savedEpisode._id);
    await project.save();
    res.status(201).json(savedEpisode);
  } catch (err) {
    res.status(400).json({ message: "Failed to add episode" });
  }
});

exports.getAllProject = catchAsync(async (req, res) => {
  let { username } = req.params;

  let projects = await User.find({ username })
    .populate("projects")
    .select("projects");

  return res.status(200).json(projects);
});

exports.getAllEpisodes = catchAsync(async (req, res) => {
  try {
    let { projectId } = req.params;
    // Find all episodes where the `project` field matches the given `projectId`
    // and populate the `project` field with the corresponding Project document
    const episodes = await Episode.find({ project: projectId });

    return res.status(200).json({ episodes });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    throw new Error("Could not retrieve episodes");
  }
});

exports.getContentByEpisodeId = catchAsync(async (req, res) => {
  let { episodeId } = req.params;
  let episode = await Episode.findById(episodeId);
  if (!episode) {
    return res.status(404).json({ message: "episode not found" });
  }
  let content = episode.content;
  return res.status(200).json({ content });
});

exports.updateContentById = catchAsync(async (req, res) => {
  let { episodeId } = req.params;
  let episode = await Episode.findById(episodeId);
  if (!episode) {
    return res.status(404).json({ message: "episode not found" });
  }

  let newContent = req.body.content;
  episode.content = newContent;
  episode.updatedAt = new Date();
  await episode.save();
  await Project.findByIdAndUpdate(episode.project, { updatedAt: new Date() });
  return res.status(200).json({ message: "successful" });
});

exports.deleteEpisode = catchAsync(async (req, res) => {
  const { episodeId, projectId } = req.params;

  // Find the project
  const project = await Project.findById(projectId);

  // Ensure the project belongs to the authenticated user
  if (project.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Find the episode
  const episode = await Episode.findById(episodeId);

  // Ensure the episode exists and belongs to the project
  if (!episode || episode.project.toString() !== projectId) {
    return res.status(404).json({ message: "Episode not found" });
  }

  // Remove the episode from the project's episodes array
  project.episodes.pull(episodeId);
  await project.save();

  // Delete the episode from the Episode collection
  await Episode.findByIdAndDelete(episodeId)

  res.json({ message: "Episode removed successfully" });
});