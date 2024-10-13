import { Router } from 'express';
import { isLoggedIn } from './app';
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from './controllers/taskController';
import { deleteAccount, forgotPassword, getAllUsers, getUserById, getUserProfile, userLogin, userLogout, userRegistration, verifyEmail } from './controllers/userController';
const router = Router();

router.post('/register', userRegistration);
router.get('/login', userLogin);
router.post('/verify-email', verifyEmail);
router.get('/reset-password', forgotPassword);
router.delete('/protected/logout', isLoggedIn, userLogout);
router.get('/protected/userprofile', isLoggedIn, getUserProfile);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);
router.delete('/delete-account', deleteAccount);
router.get('/protected/tasks', isLoggedIn, getAllTasks);
router.post('/protected/tasks', isLoggedIn, createTask);
router.get('/protected/tasks/:id', isLoggedIn, getTaskById);
router.put('/tasks/:id', updateTask);
router.delete('/protected/tasks/:id', isLoggedIn, deleteTask);

export default router;