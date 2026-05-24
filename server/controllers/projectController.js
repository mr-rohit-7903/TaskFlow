const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { 'members.user': req.user._id };

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Attach task counts
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const stats = { todo: 0, 'in-progress': 0, review: 0, done: 0, total: 0 };
        taskStats.forEach(({ _id, count }) => {
          stats[_id] = count;
          stats.total += count;
        });
        return { ...project.toObject(), taskStats: stats };
      })
    );

    res.json({ success: true, count: projectsWithStats.length, data: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember =
      req.user.role === 'admin' ||
      project.members.some((m) => m.user._id.toString() === req.user._id.toString());

    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res, next) => {
  try {
    const { title, description, status, priority, color, dueDate, tags } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      priority,
      color,
      dueDate,
      tags,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    await Activity.create({
      user: req.user._id,
      action: 'project_created',
      target: { type: 'project', id: project._id, title: project.title },
      project: project._id,
    });

    await project.populate('createdBy', 'name email avatar');
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner =
      project.createdBy.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy members.user', 'name email avatar');

    await Activity.create({
      user: req.user._id,
      action: 'project_updated',
      target: { type: 'project', id: project._id, title: project.title },
      project: project._id,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner =
      project.createdBy.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });

    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin)
const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User already a member' });

    project.members.push({ user: user._id, role: 'member' });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    await Activity.create({
      user: req.user._id,
      action: 'member_added',
      target: { type: 'project', id: project._id, title: project.title },
      meta: { memberName: user.name },
      project: project._id,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin)
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
