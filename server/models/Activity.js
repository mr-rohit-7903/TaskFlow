const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      required: true,
      enum: [
        'task_created', 'task_updated', 'task_deleted', 'task_moved',
        'task_assigned', 'comment_added', 'project_created', 'project_updated',
        'member_added', 'member_removed',
      ],
    },
    target: {
      type: { type: String, enum: ['task', 'project'] },
      id: { type: mongoose.Schema.Types.ObjectId },
      title: { type: String },
    },
    meta: { type: mongoose.Schema.Types.Mixed },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

activitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
