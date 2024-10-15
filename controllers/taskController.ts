import { Request, Response } from "express";
import Task from "../models/taskModel";


export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, dueDate, completed = false, priority = 'medium', status = 'pending' } = req.body;
        const userId = req.params.userId;

        if (!title || !description || !dueDate) {
            return res.status(400).json({ message: 'Title, description, and due date are required' });
        }

        const task = await Task.create({
            title,
            description,
            dueDate,
            completed,
            priority,
            status,
            userId
        });

        return res.status(200).json(task);

    } catch (error) {
        console.log('Error in creating task: ', error);
        return res.status(500).json({ message: 'Error in creating task', error });
    }
};


export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const tasks = await Task.findAll({
            where: { userId }
        });
        if (!tasks.length) {
            return res.status(404).json({ message: 'No tasks found for this user' })
        }
        return res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error in getting tasks: ', error });
    }
}

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const { userId, taskId } = req.params;
        const task = await Task.findOne({
            where: {
                id: taskId,
                userId
            }
        })
        if (!task) {
            return res.status(404).json({ message: 'Task not found for this user' });
        }
        return res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error getting task: ', error })
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { userId, taskId } = req.params;
        const { title, description, dueDate, completed = false, priority = 'medium', status = 'pending' } = req.body;
        const task = await Task.findOne({
            where: {
                id: taskId,
                userId
            }
        })
        if (!task) {
            return res.status(404).json({ message: 'Task not found for this user' })
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
    } catch (error) {
        res.status(500).json({ message: 'Error in updating task: ', error });
        console.log('Error while updating task', error);
    }
}

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { userId, taskId } = req.params;
        const task = await Task.findOne({
            where: {
                id: taskId,
                userId
            }
        })
        if (!task) {
            return res.status(404).json({ message: "Task not found for this user" });
        }

        await task.destroy();
        return res.status(200).json({ message: 'Task successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error in deleting task: ', error });
    }
};