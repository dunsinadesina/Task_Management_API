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
import { sendVerificationMail, sendPasswordResetMail } from '../nodemailer';

//register new user
export const userRegistration = [
    // Validation middleware
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
            // Check if user already exists in the database
            let user = await User.findOne({ where: { email } });
            if (user) {
                return res.status(400).json({ message: 'User already has an account' });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create the user in the database
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                emailToken: crypto.randomBytes(64).toString('hex'),
                isVerified: false
            });

            // Generate JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
                expiresIn: '1h'
            });


            // Create user profile
            await UserProfile.create({
                name,
                email,
                userid: user.id,
                isLoggedIn: false
            });
            console.log('UserProfile created:', { name, email, userid: user.id });


            console.log("JWT token generated:", token);

            // Send verification email
            try {
                sendVerificationMail(user.email, user.emailToken, user.name);
                console.log("Verification email sent to:", user.email);
                return res.status(200).json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    token,
                    isVerified: user.isVerified,
                    message: 'User successfully added and verification email sent'
                });
            } catch (emailError) {
                console.error("Error sending verification email:", emailError);
                return res.status(500).json({ message: 'Error sending verification email' });
            }

        } catch (error) {
            console.error("Server error:", error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

export const verifyEmailAddress = async (req: Request, res: Response) => {
    const { emailToken } = req.params;

    try {
        // Find the user by emailToken
        const user = await User.findOne({ where: { emailToken: emailToken } });

        if (!user) {
            console.log('Invalid or expired token')
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update the user's isVerified status
        user.isVerified = true;
        user.emailToken = ''; // Clear the token after verification
        await user.save();
        console.log("User verified status updated to:", user.isVerified);

        res.status(200).json({ message: 'Email successfully verified!' });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

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
    async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } })
            if (!user) {
                console.error('Invalid error')
                return res.status(401).json({ message: 'Invalid email' })
            }

            // Check if user exists
            if (!user) {
                return res.status(401).json({ message: 'Invalid email' });
            }

            // Check if user's email is verified
            if (!user.isVerified) {
                console.error('Please verify your email to login')
                return res.status(403).json({ message: 'Please verify your email to login' });
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

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000//a week
            });

            return res.json({
                message: 'Login successful'
            });

        } catch (error) {
            console.error("Login error:", error);
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
        const userProfile = await UserProfile.create({
            name,
            email,
            userid: user.id,
            isLoggedIn: false
        });
        console.log('User profile created:', userProfile);

        return res.status(201).json({ message: 'User created successfully via Google sign-in', user });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


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

            try {
                // Send the email with the link containing the token
                await sendPasswordResetMail(email, token, user.name);
                return res.status(200).json({ message: 'Password reset link has been sent to your email' });
            } catch (emailError) {
                console.error('Error sending password reset email:', emailError);
                return res.status(500).json({ message: 'Error sending email. Please try again later.' });
            }
        } else {
            return res.status(403).json({ message: 'Email does not exist. Do you want to create an account?' });
        }
    } catch (error) {
        console.error('Error in forgotPassword function:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};


export const resetPassword = async (req: Request, res: Response) => {
    const { token } = req.params; // Extract the token directly
    const { newPassword } = req.body;

    console.log('Received reset token:', token);

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        // Ensure that token is passed as a string in the query
        const resetToken = await PasswordResetToken.findOne({ where: { token } });
        console.log('Found reset token:', resetToken);

        if (!resetToken || resetToken.expiryDate < new Date()) {
            console.log('Invalid or expired token:', resetToken);
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findByPk(resetToken.userId);

        if (!user) {
            console.log('User not found for token:', resetToken.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await resetToken.destroy();

        console.log('Password reset successful for user:', user.id);
        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};


export const userLogout = async (req: Request, res: Response) => {

    try {
        const { email } = req.body;
        // Update isLoggedIn field to false
        const userProfile = await UserProfile.findOne({ where: { email } });
        if (userProfile) {
            await userProfile.update({ isLoggedIn: false });
            res.redirect(`${process.env.FRONTEND_URL}/homepage`);
            //clear the cookie
            res.clearCookie('token');
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
    if (!id) {
        console.log(`User profile not found for ID: ${id}`);
        return res.status(400).json({ error: 'User ID is required' });
    }
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
        console.log('Error fetching user profile', error);
        return res.status(500).json({ error: 'Error creating user profile' });
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