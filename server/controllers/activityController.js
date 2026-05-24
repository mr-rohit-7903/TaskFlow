const Activity = require('../models/Activity');
const Project = require('../models/Project');

// @desc    Get activity feed
// @route   GET /api/activity
// @access  Private
const getActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const projectFilter =
      req.user.role === 'admin'
        ? {}
        : { 'members.user': req.user._id };

    const userProjects = await Project.find(projectFilter).select('_id');
    const projectIds = userProjects.map((p) => p._id);

    const filter = { project: { $in: projectIds } };
    if (req.query.project) filter.project = req.query.project;

    const activities = await Activity.find(filter)
      .populate('user', 'name avatar email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivity };
