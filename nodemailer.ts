import dotenv from 'dotenv';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

dotenv.config();

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

export const sendVerificationMail = async (email: string, displayName: string) => {
    try {
        // Generate email verification link
        const actionCodeSettings = {
            url: 'https://taskify-lac-beta.vercel.app/verify-email',
            handleCodeInApp: true,
        };

        const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verify your email for Taskify',
            html: `<p>Hello ${displayName},</p>
                   <p>Follow this link to verify your email address:</p>
                   <p><a href="${emailVerificationLink}">Verify your email</a></p>
                   <p>If you didn’t ask to verify this address, you can ignore this email.</p>
                   <p>Thanks,</p>
                   <p>Your Taskify team</p>`,
        };

        transporter.sendMail(mailOptions, (error: any, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (error) {
        console.error('Error generating email verification link:', error);
    }
};

export const sendPasswordResetMail = async (email: string, emailToken: string) => {
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${emailToken}`;
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset',
        html: `<p>Hello ${email},</p>
               <p>Reset your password by clicking this link:</p>
               <p><a href="${resetPasswordLink}">Reset Your Password</a></p>`,
    };

    transporter.sendMail(mailOptions, (error: any, info) => {
        if (error) {
            console.error('Error sending email: ', error);
        } else {
            console.log('Email sent: ', info.response);
        }
    });
};