import { Router } from 'express';
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from './controllers/taskController';
import { getAllUsers, getUserById, getUserProfile, userLogin, userLogout, userRegistration } from './controllers/userController';

const router = Router();

router.post('/register', userRegistration);
router.get('/login', userLogin);
router.delete('/logout', userLogout);
router.get('/userprofile', getUserProfile);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);
router.get('/tasks', getAllTasks);
router.post('/tasks', createTask);
router.get('/tasks/:id', getTaskById);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;