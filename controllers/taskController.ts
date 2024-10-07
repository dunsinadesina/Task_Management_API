import { Request, Response } from "express";
import Task from "../models/taskModel";

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, dueDate, completed = false, priority = 'medium', status = 'pending' } = req.body;
        if (!title || !description || !dueDate) {
            return res.status(400).json({ message: 'Title, description and due date are required' });
        }
        const task = await Task.create({ title, description, dueDate, completed, priority, status });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error in creating task: ', error });
        console.log('Error in creating task: ', error)
    }
}

export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await Task.findAll();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error in getting tasks: ', error });
    }
}

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(400).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error getting task: ', error })
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const task = await Task.findByPk(req.params.id);
        const { title, description, dueDate, completed = false, priority = 'medium', status = 'pending' } = req.body;
        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }
        //update task fields
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
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
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        await task.destroy();
        res.status(200).send();
    } catch (error) {
        res.status(500).json({ message: 'Error in deleting task: ', error });
    }
};