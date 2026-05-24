const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getUsers);
router.route('/:id').get(protect, getUser).delete(protect, adminOnly, deleteUser);
router.put('/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;
