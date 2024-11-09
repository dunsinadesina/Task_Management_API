import { Router } from 'express';
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from './controllers/taskController';
import { deleteAccount, forgotPassword, getAllUsers, getUserById, getUserProfile, googleSignIn, resetPassword, userLogin, userLogout, userRegistration, verifyEmailAddress } from './controllers/userController';

const router = Router();

router.post('/register', userRegistration);
router.post('/login', userLogin);
router.get('/verify-email/:emailToken', verifyEmailAddress);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/logout', userLogout);
router.get('/userprofile', getUserProfile);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);
router.delete('/delete-account/:id', deleteAccount);
router.get('/users/:userId/tasks', getAllTasks);
router.post('/users/:userId/tasks', createTask);
router.get('/users/:userId/tasks/:id', getTaskById);
router.put('/users/:userId/tasks/:id', updateTask);
router.delete('/users/:userId/tasks/:id', deleteTask);
router.post('/google-sign-in', googleSignIn);

export default router;