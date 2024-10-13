import nodemailer from 'nodemailer';
import User from './models/userModel';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendTaskNotification = (email: string, taskTitle: string) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Task Deadline Reminder',
        text: `Reminder: Your task "${taskTitle}" is approaching its deadline.`,
    };

    transporter.sendMail(mailOptions, (error: any, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

export const sendVerificationMail = (email: string, emailToken: string) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Hello ${User.name} 👋, verify your email by clicking this link...</p>
    <a ${verificationLink}' >Verify Your Email</a>`,
    };

    transporter.sendMail(mailOptions, (error: any, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return error;
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

export const sendPasswordResetMail = async (email: string, emailToken: string) => {
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${emailToken}`
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset',
        html: `<p>Hello ${email} 👋, reset your password by clicking this link...</p>
    <a ${resetPasswordLink}' >Reset Your Password</a>`
    };

    transporter.sendMail(mailOptions, (error: any, info) => {
        if (error) {
            console.error('Error sending email: ', error);
            return error;
        } else {
            console.log('Email sent: ', info.response);
        }
    });
}