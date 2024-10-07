import dotenv from 'dotenv';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Task from '../models/taskModel';

dotenv.config();

// Morning Reminder (9 AM)
cron.schedule('0 9 * * *', async () => {
    await sendTaskReminders();
});

// Evening Reminder (6 PM)
cron.schedule('0 18 * * *', async () => {
    await sendTaskReminders();
});

// Function to find tasks and send reminders
async function sendTaskReminders() {
    try {
        const now = new Date();
        const upcomingTasks = await Task.findAll({
            where: {
                dueDate: {
                    // Tasks due within the next 24 hours
                    $gte: now,
                    $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                },
            },
        });

        for (const task of upcomingTasks) {
            await sendEmailNotification(task);
        }
    } catch (error) {
        console.error('Error checking tasks or sending notifications:', error);
    }
}

// Email function
async function sendEmailNotification(task: any) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: task.email,
        subject: `Reminder: Task "${task.name}" is due soon`,
        text: `This is a reminder that your task "${task.name}" is due on ${task.dueDate}. Please make sure to complete it on time.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent for task: ${task.name}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
