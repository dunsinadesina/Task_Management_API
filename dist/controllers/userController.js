"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.getAllUsers = exports.getUserById = exports.getUserProfile = exports.userLogout = exports.resetPassword = exports.forgotPassword = exports.googleSignIn = exports.userLogin = exports.verifyEmailAddress = exports.userRegistration = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const firebase_1 = require("../firebase");
const resetPassword_1 = require("../models/resetPassword");
const taskModel_1 = __importDefault(require("../models/taskModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const userProfileModel_1 = __importDefault(require("../models/userProfileModel"));
const nodemailer_1 = require("../nodemailer");
//register new user
exports.userRegistration = [
    // Validation middleware
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Password must contain at least 6 characters').isLength({ min: 6 }),
    async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        try {
            // Check if user already exists in the database
            let user = await userModel_1.default.findOne({ where: { email } });
            if (user) {
                return res.status(400).json({ message: 'User already has an account' });
            }
            // Hash the password
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Create the user in the database
            user = await userModel_1.default.create({
                name,
                email,
                password: hashedPassword,
                emailToken: crypto_1.default.randomBytes(64).toString('hex'),
                isVerified: false
            });
            // Create user profile
            await userProfileModel_1.default.create({
                name,
                email,
                userid: user.id,
                isLoggedIn: false
            });
            // Generate JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });
            console.log("JWT token generated:", token);
            // Send verification email
            try {
                (0, nodemailer_1.sendVerificationMail)(user.email, user.emailToken, user.name);
                console.log("Verification email sent to:", user.email);
                return res.status(200).json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    token,
                    isVerified: user.isVerified,
                    message: 'User successfully added and verification email sent'
                });
            }
            catch (emailError) {
                console.error("Error sending verification email:", emailError);
                return res.status(500).json({ message: 'Error sending verification email' });
            }
        }
        catch (error) {
            console.error("Server error:", error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];
const verifyEmailAddress = async (req, res) => {
    const { emailToken } = req.params;
    try {
        // Find the user by emailToken
        const user = await userModel_1.default.findOne({ where: { emailToken: emailToken } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        // Update the user's isVerified status
        user.isVerified = true;
        user.emailToken = ''; // Clear the token after verification
        await user.save();
        console.log("User verified status updated to:", user.isVerified);
        res.status(200).json({ message: 'Email successfully verified!' });
    }
    catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};
exports.verifyEmailAddress = verifyEmailAddress;
//logging in with google
// export const userLoginWithGoogle =async (req:Request, res:Response) => {
//     account.createOAuth2Session(
//         'google',
//         'https://task-management-api-2.onrender.com',
//         'https://task-management-api-2.onrender.com/fail'
//     )
// }
//Login user
exports.userLogin = [
    async (req, res) => {
        const { email, password } = req.body;
        try {
            // Check if user exists
            const user = await userModel_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email' });
            }
            // Check if user's email is verified
            if (!user.isVerified) {
                return res.status(403).json({ message: 'Please verify your email to login' });
            }
            // Check if password is correct
            const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ message: 'Invalid password' });
            }
            // Generate JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });
            return res.json({
                message: 'Login successful',
                token
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];
const googleSignIn = async (req, res) => {
    const { idToken } = req.body;
    try {
        // Verify the ID token using Firebase Admin
        const decodedToken = await firebase_1.adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        // Ensure email is defined
        const email = decodedToken.email ?? (() => { throw new Error("Missing email in decoded token"); })();
        const name = decodedToken.name || "Google User";
        // Check if user already exists in the database
        let user = await userModel_1.default.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already has an account' });
        }
        // Hash a random password since Google sign-in doesn't require one
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(crypto_1.default.randomBytes(16).toString('hex'), salt);
        // Create a new user in the database
        user = await userModel_1.default.create({
            name,
            email,
            password: hashedPassword, // Placeholder password
            emailToken: crypto_1.default.randomBytes(64).toString('hex'),
            isVerified: true
        });
        // Create user profile
        await userProfileModel_1.default.create({
            name,
            email,
            userid: user.id,
            isLoggedIn: true
        });
        return res.status(201).json({ message: 'User created successfully via Google sign-in', user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.googleSignIn = googleSignIn;
const generateToken = () => {
    return (0, uuid_1.v4)();
};
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel_1.default.findOne({ where: { email } });
        if (user) {
            const token = generateToken();
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);
            await resetPassword_1.PasswordResetToken.create({ userId: user.id, token, expiryDate });
            try {
                // Send the email with the link containing the token
                await (0, nodemailer_1.sendPasswordResetMail)(email, token, user.name);
                return res.status(200).json({ message: 'Password reset link has been sent to your email' });
            }
            catch (emailError) {
                console.error('Error sending password reset email:', emailError);
                return res.status(500).json({ message: 'Error sending email. Please try again later.' });
            }
        }
        else {
            return res.status(403).json({ message: 'Email does not exist. Do you want to create an account?' });
        }
    }
    catch (error) {
        console.error('Error in forgotPassword function:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token } = req.params; // Extract the token directly
    const { newPassword } = req.body;
    console.log('Received reset token:', token);
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }
    try {
        // Ensure that token is passed as a string in the query
        const resetToken = await resetPassword_1.PasswordResetToken.findOne({ where: { token } });
        console.log('Found reset token:', resetToken);
        if (!resetToken || resetToken.expiryDate < new Date()) {
            console.log('Invalid or expired token:', resetToken);
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        const user = await userModel_1.default.findByPk(resetToken.userId);
        if (!user) {
            console.log('User not found for token:', resetToken.userId);
            return res.status(404).json({ message: 'User not found' });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        await resetToken.destroy();
        console.log('Password reset successful for user:', user.id);
        return res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.resetPassword = resetPassword;
const userLogout = async (req, res) => {
    const { email } = req.body;
    try {
        // Update isLoggedIn field to false
        const userProfile = await userProfileModel_1.default.findOne({ where: { email } });
        if (userProfile) {
            await userProfile.update({ isLoggedIn: false });
            res.redirect(`${process.env.FRONTEND_URL}/homepage`);
            return res.status(200).json({ message: 'Logout successful' });
        }
        else {
            return res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.log('Error logging out:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.userLogout = userLogout;
const getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const userProfile = await userProfileModel_1.default.findOne({
            where: {
                userid: id
            }
        });
        if (userProfile) {
            res.status(200).json(userProfile);
        }
        else {
            console.log('User profile not found');
            res.status(404).json({ error: 'User profile not found' });
        }
    }
    catch (error) {
        console.log('Error creating user profile', error);
        res.status(500).json({ error: 'Error creating user profile' });
    }
};
exports.getUserProfile = getUserProfile;
const getUserById = async (req, res) => {
    const { id } = req.params; // Get user ID from URL parameter
    try {
        const user = await userModel_1.default.findByPk(id, {
            attributes: ['id', 'name', 'email']
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user); // Return user information
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
exports.getUserById = getUserById;
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel_1.default.findAll({
            attributes: ['id', 'name', 'email']
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
const deleteAccount = async (req, res) => {
    const userId = req.params.id;
    try {
        // Find the user by primary key
        const user = await userModel_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Delete associated tasks (assuming tasks have a userId field)
        await taskModel_1.default.destroy({ where: { userId } });
        // Delete the user
        await userModel_1.default.destroy({ where: { id: userId } });
        return res.status(200).json({ message: 'Account and associated tasks deleted successfully' });
    }
    catch (err) {
        console.error("Error deleting account", err);
        return res.status(500).json({ message: 'Failed to delete account' });
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=userController.js.map