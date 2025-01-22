"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
dotenv_1.default.config();
// Morning Reminder (9 AM)
node_cron_1.default.schedule('0 9 * * *', async () => {
    await sendTaskReminders();
});
// Evening Reminder (6 PM)
node_cron_1.default.schedule('0 18 * * *', async () => {
    await sendTaskReminders();
});
// Function to find tasks and send reminders
async function sendTaskReminders() {
    try {
        const now = new Date();
        const upcomingTasks = await taskModel_1.default.findAll({
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
    }
    catch (error) {
        console.error('Error checking tasks or sending notifications:', error);
    }
}
// Email function
async function sendEmailNotification(task) {
    const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
}
//# sourceMappingURL=tasksReminders.js.map