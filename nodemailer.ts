import nodemailer from 'nodemailer';

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
