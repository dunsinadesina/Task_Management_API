"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getAllTasks = exports.createTask = void 0;
const taskModel_1 = __importDefault(require("../models/taskModel"));
const createTask = async (req, res) => {
    try {
        const { title, description, dueDate, completed = false, priority = 'medium', status = 'pending', subtasks = [], estimatedTime = { hours: 0, minutes: 0 }, tags = [] } = req.body;
        const finalCompleted = completed ?? false;
        const finalPriority = priority ?? 'medium';
        const finalStatus = status ?? 'pending';
        const userId = req.params.userId;
        if (!userId) {
            console.log('User id required');
            return res.status(400).json({ message: 'User id required' });
        }
        if (isNaN(new Date(dueDate).getTime())) {
            console.log('Invalid due date format');
            return res.status(400).json({ message: 'Invalid due date format' });
        }
        if (!Array.isArray(subtasks) || !Array.isArray(tags)) {
            console.log('Subtasks and tags must be in an array');
            return res.status(400).json({ message: 'Subtasks and tags must be in an array' });
        }
        if (typeof estimatedTime.hours != 'number' || typeof estimatedTime.minutes != 'number') {
            console.log('Invalid estimated time format');
            return res.status(400).json({ message: 'Invalid estimated time format' });
        }
        if (!title || !description || !dueDate) {
            return res.status(400).json({ message: 'Title, description, and due date are required' });
        }
        const task = await taskModel_1.default.create({
            title,
            description,
            dueDate,
            completed,
            priority,
            status,
            userId,
            subtasks,
            estimatedTime,
            tags
        });
        return res.status(201).json(task);
    }
    catch (error) {
        console.log('Error in creating task: ', error);
        return res.status(500).json({ message: 'Error in creating task' });
    }
};
exports.createTask = createTask;
const getAllTasks = async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await taskModel_1.default.findAll({
            where: { userId }
        });
        if (!tasks.length) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }
        return res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error in getting tasks: ', error });
    }
};
exports.getAllTasks = getAllTasks;
const getTaskById = async (req, res) => {
    try {
        const { userId, taskId } = req.params;
        const task = await taskModel_1.default.findOne({
            where: {
                id: taskId,
                userId
            }
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found for this user' });
        }
        return res.status(200).json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting task: ', error });
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res) => {
    try {
        const { userId, taskId } = req.params;
        const { title, description, dueDate, completed = false, priority = 'medium', status = 'pending' } = req.body;
        const task = await taskModel_1.default.findOne({
            where: {
                id: taskId,
                userId
            }
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found for this user' });
        }
        //update task fields
        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.completed = completed;
        task.priority = priority;
        task.status = status;
        //save task
        await task.save();
        return res.status(200).json({ message: 'Task successfully updated', updatedTask: task });
    }
    catch (error) {
        res.status(500).json({ message: 'Error in updating task: ', error });
        console.log('Error while updating task', error);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { userId, taskId } = req.params;
        const task = await taskModel_1.default.findOne({
            where: {
                id: taskId,
                userId
            }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found for this user" });
        }
        await task.destroy();
        return res.status(200).json({ message: 'Task successfully deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error in deleting task: ', error });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map