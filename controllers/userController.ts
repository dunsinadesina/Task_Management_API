import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { adminAuth } from '../firebase';
import { PasswordResetToken } from '../models/resetPassword';
import Task from '../models/taskModel';
import User from "../models/userModel";
import UserProfile from '../models/userProfileModel';
import { sendPasswordResetMail, sendVerificationMail } from '../nodemailer';

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
            sendVerificationMail(user.email, user.emailToken);
            console.log(token);
            return res.status(201).json({ message: 'User successfully added and User Profile successfully created', token })

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

//logging in with google
// export const userLoginWithGoogle =async (req:Request, res:Response) => {
//     account.createOAuth2Session(
//         'google',
//         'https://task-management-api-2.onrender.com',
//         'https://task-management-api-2.onrender.com/fail'
//     )
// }

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

export const googleSignIn = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    try {
        // Verify the ID token using Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Ensure email is defined
        const email: string = decodedToken.email ?? (() => { throw new Error("Missing email in decoded token") })();
        const name: string = decodedToken.name || "Google User";

        // Check if user already exists in the database
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already has an account' });
        }

        // Hash a random password since Google sign-in doesn't require one
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), salt);

        // Create a new user in the database
        user = await User.create({
            name,
            email,
            password: hashedPassword, // Placeholder password
            emailToken: crypto.randomBytes(64).toString('hex'),
            isVerified: true
        });

        // Create user profile
        await UserProfile.create({
            name,
            email,
            userid: user.id,
            isLoggedIn: true
        });

        return res.status(201).json({ message: 'User created successfully via Google sign-in', user });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { emailToken } = req.body;
        if (!emailToken) {
            return res.status(400).json({ message: 'Email token not found...' });
        }
        const user = await User.findOne({ where: { emailToken } });
        if (user) {
            user.emailToken = 'null';
            user.isVerified = true;
            await user.save();
            const secretKey = process.env.JWT_SECRET;
            const createToken = (userId: string) => {
                return jwt.sign({ userId }, secretKey as string, { expiresIn: '1h' });
            };
            const token = createToken(user.id);
            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                token,
                isVerified: user.isVerified,
            });
        } else {
            res.status(404).json({ message: 'Email Verification failed, invalid token' })
        }
    } catch (error) {
        console.log("Error in email verification: ", error)
        res.status(500).json({ message: 'Server Error!', error })
    }
}

const generateToken = () => {
    return uuidv4();
}
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            const token = generateToken();
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);
            await PasswordResetToken.create({ userId: user.id, token, expiryDate });
            //send the email with the link containing the token
            await sendPasswordResetMail(email, token);
            return res.status(200).json({ message: 'Password reset link has been sent to your email' });
        } else {
            return res.status(403).json({ message: 'Email does not exist. Do you want to create an account?' });
        }
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ message: 'Server Error' });
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        const resetToken = await PasswordResetToken.findOne({ where: { token } });

        if (!resetToken || resetToken.expiryDate < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findByPk(resetToken.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await resetToken.destroy();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};


export const userLogout = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        // Update isLoggedIn field to false
        const userProfile = await UserProfile.findOne({ where: { email } });
        if (userProfile) {
            await userProfile.update({ isLoggedIn: false });
            res.redirect(`${process.env.FRONTEND_URL}/homepage`);
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

export const deleteAccount = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        // Find the user by primary key
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete associated tasks (assuming tasks have a userId field)
        await Task.destroy({ where: { userId } });

        // Delete the user
        await User.destroy({ where: { id: userId } });

        return res.status(200).json({ message: 'Account and associated tasks deleted successfully' });
    } catch (err) {
        console.error("Error deleting account", err);
        return res.status(500).json({ message: 'Failed to delete account' });
    }
};