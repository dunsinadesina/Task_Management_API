import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import User from "../models/userModel";
import UserProfile from '../models/userProfileModel';

//register new user
export const userRegistration = [
    //validation middleware
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must contain at least 6 characters').isLength({ min: 6 }),

    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            //to check if user already exists
            let user = await User.findOne({ where: { email } });
            if (user) {
                return res.status(400).json({ message: 'User already has an account' });
            }

            //to hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            //creating the user
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                emailToken: crypto.randomBytes(64).toString('hex'),
                isVerified: false
            });

            // Create user profile
            await UserProfile.create({
                name,
                email,
                userid: user.id,
                isLoggedIn: false
            });

            //to generate jwt token
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
                expiresIn: '1h'
            });
            res.status(201).json({message: 'User successfully added and User Profile successfully created', token})

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

//Login user
export const userLogin = [
    // Validation middleware
    check('email', 'Please type in a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if user exists
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email' });
            }

            // Check if password is correct
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ message: 'Invalid password' });
            }

            // Generate JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
                expiresIn: '1h'
            });

            res.json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

export const userLogout = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        // Update isLoggedIn field to false
        const userProfile = await UserProfile.findOne({ where: { email } });
        if (userProfile) {
            await userProfile.update({ isLoggedIn: false });
            return res.status(200).json({ message: 'Logout successful' });
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log('Error logging out:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const userProfile = await UserProfile.findOne({
            where: {
                userid: id
            }
        });
        if (userProfile) {
            res.status(200).json(userProfile);
        } else {
            console.log('User profile not found');
            res.status(404).json({ error: 'User profile not found' });
        }
    } catch (error) {
        console.log('Error creating user profile', error);
        res.status(500).json({ error: 'Error creating user profile' });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params; // Get user ID from URL parameter
    try {
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);  // Return user information
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email']
        })
        res.json(users)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' })
    }
}