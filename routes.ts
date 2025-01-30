import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from './controllers/taskController';
import { deleteAccount, forgotPassword, getAllUsers, getUserById, getUserProfile, googleSignIn, resetPassword, userLogin, userLogout, userRegistration, verifyEmailAddress } from './controllers/userController';

const router = Router();

router.post('/register', userRegistration);
router.post('/login', userLogin);
router.get('/verify-email/:emailToken', verifyEmailAddress);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.delete('/logout', authenticateUser, userLogout);
router.get('/userprofile/:id', authenticateUser, getUserProfile);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);
router.delete('/delete-account/:id', deleteAccount);
router.get('/users/:userId/tasks', authenticateUser, getAllTasks);
router.post('/users/:id/tasks', authenticateUser, createTask);
router.get('/users/:userId/tasks/:id', authenticateUser, getTaskById);
router.patch('/users/:userId/tasks/:id', authenticateUser, updateTask);
router.delete('/users/:userId/tasks/:id', authenticateUser, deleteTask);
router.post('/google-sign-in', googleSignIn);

export default router;