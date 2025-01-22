"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetMail = exports.sendVerificationMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
//Create a transporter object
const createMailTransporter = () => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD, //app password
        },
    });
    return transporter;
};
const sendVerificationMail = (email, emailToken, name) => {
    const transporter = createMailTransporter();
    const mailOptions = {
        from: {
            name: 'Taskify',
            address: process.env.EMAIL
        },
        to: email,
        subject: "Verify your email for Taskify",
        html: `<p>Hello 👋 ${name},</p>
        <p>Click on the link below to verify your email address for Taskify.</p>
    <a href='https://taskify-lac-beta.vercel.app/verify-email?token=${emailToken}'>Verify Your Email</a>,
    <p>If you didn’t ask to verify this address, you can ignore this email.</p>
    <p>Thanks,</p>
    <p>Taskify Team</p>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
};
exports.sendVerificationMail = sendVerificationMail;
const sendPasswordResetMail = async (email, passwordResetToken, name) => {
    const transporter = createMailTransporter();
    const mailOptions = {
        from: {
            name: 'Taskify',
            address: process.env.EMAIL
        },
        to: email,
        subject: "Reset your password for Taskify",
        html: `<p>Hello ${name} 👋,</p>
        <p>Click on the link below to reset your password for Taskify:</p>
        <a href="https://taskify-lac-beta.vercel.app/reset-password?token=${passwordResetToken}">Reset Your Password</a>
        <p>If you didn't ask to reset your password, you can ignore this email.</p>
        <p>Thanks,</p>
        <p>Taskify Team</p>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
};
exports.sendPasswordResetMail = sendPasswordResetMail;
//# sourceMappingURL=nodemailer.js.map