const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get tasks for a project
// @route   GET /api/tasks?project=:id
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignee) filter.assignee = req.query.assignee;

    // Text search
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .populate('project', 'title color');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project, assignee, dueDate, labels, estimatedHours } = req.body;

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found' });

    // Count existing tasks in that status for ordering
    const count = await Task.countDocuments({ project, status: status || 'todo' });

    const task = await Task.create({
      title, description, status, priority, project, assignee, dueDate, labels, estimatedHours,
      createdBy: req.user._id,
      order: count,
    });

    await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    await Activity.create({
      user: req.user._id,
      action: 'task_created',
      target: { type: 'task', id: task._id, title: task.title },
      project: task.project,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const prevStatus = task.status;
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name avatar');

    // Log status change
    if (req.body.status && req.body.status !== prevStatus) {
      await Activity.create({
        user: req.user._id,
        action: 'task_moved',
        target: { type: 'task', id: task._id, title: task.title },
        meta: { from: prevStatus, to: req.body.status },
        project: task.project,
      });
    } else {
      await Activity.create({
        user: req.user._id,
        action: 'task_updated',
        target: { type: 'task', id: task._id, title: task.title },
        project: task.project,
      });
    }

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await Activity.create({
      user: req.user._id,
      action: 'task_deleted',
      target: { type: 'task', id: task._id, title: task.title },
      project: task.project,
    });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();
    await task.populate('comments.user', 'name avatar');

    await Activity.create({
      user: req.user._id,
      action: 'comment_added',
      target: { type: 'task', id: task._id, title: task.title },
      project: task.project,
    });

    res.status(201).json({ success: true, data: task.comments[task.comments.length - 1] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const projectFilter =
      req.user.role === 'admin'
        ? {}
        : { 'members.user': req.user._id };

    const Project = require('../models/Project');
    const userProjects = await Project.find(projectFilter).select('_id');
    const projectIds = userProjects.map((p) => p._id);

    const [taskStats, projectCount] = await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Project.countDocuments(projectFilter),
    ]);

    const stats = { todo: 0, 'in-progress': 0, review: 0, done: 0, total: 0, projects: projectCount };
    taskStats.forEach(({ _id, count }) => {
      stats[_id] = count;
      stats.total += count;
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, addComment, getStats };
