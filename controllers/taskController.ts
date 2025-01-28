import { Request, Response } from "express";
import Task from "../models/taskModel";
import User from "../models/userModel";
import { use } from "passport";
import UserProfile from "../models/userProfileModel";


export const createTask = async (req: Request, res: Response) => {
    try {
        const { title,
            description,
            dueDate,
            completed = false,
            priority = 'medium',
            status = 'pending',
            subtasks = [],
            estimatedTime = { hours: 0, minutes: 0 },
            tags = []
        } = req.body;

        const userId = req.params.userId;
        console.log('User ID from params:', userId);

        if (!userId) {
            console.log('User id required')
            return res.status(400).json({ message: 'User id required' })
        }

        if (isNaN(Date.parse(dueDate))) {
            console.log('Invalid due date format')
            return res.status(400).json({ message: 'Invalid due date format' })
        }

        if (!Array.isArray(subtasks) || !Array.isArray(tags)) {
            console.log('Subtasks and tags must be in an array')
            return res.status(400).json({ message: 'Subtasks and tags must be in an array' })
        }

        if (typeof estimatedTime.hours != 'number' || typeof estimatedTime.minutes != 'number') {
            console.log('Invalid estimated time format')
            return res.status(400).json({ message: 'Invalid estimated time format' })
        }

        if (!title || !description || !dueDate) {
            return res.status(400).json({ message: 'Title, description, and due date are required' });
        }
        const userExists = await UserProfile.findByPk(userId);
        if (!userExists) {
            console.log('User does not exist');
            return res.status(404).json({ message: 'User does not exist' });
        }


        const task = await Task.create({
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

    } catch (error) {
        console.error('Error in creating task: ', error);
        return res.status(500).json({ message: 'Error in creating task' });
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
        console.error('Error while getting task', error);
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
        console.error('Error while getting task', error);
        res.status(500).json({ message: 'Error getting task: ', error })
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { userId,
            taskId
        } = req.params;
        const { title,
            description,
            dueDate,
            completed = false,
            priority = 'medium',
            status = 'pending',
            subtasks = [],
            estimatedTime = { hours: 0, minutes: 0 },
            tags = []
        } = req.body;
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
        task.subtasks = subtasks;
        task.estimatedTime = estimatedTime;
        task.tags = tags;
        //save task
        await task.save();
        return res.status(200).json({ message: 'Task successfully updated', updatedTask: task });
    } catch (error) {
        res.status(500).json({ message: 'Error in updating task: ', error });
        console.error('Error while updating task', error);
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
        console.error('Error while deleting task', error);
        res.status(500).json({ message: 'Error in deleting task: ', error });
    }
};