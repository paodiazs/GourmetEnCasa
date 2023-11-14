const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/register', UserController.registerUser);
router.put('/update/:id', UserController.updateUser);
router.put('/update-password', UserController.updatePassword);
router.delete('/delete/:id', UserController.deleteUser);
router.get('/:id', UserController.getUserById);

module.exports = router;
