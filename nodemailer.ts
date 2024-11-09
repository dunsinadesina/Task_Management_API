import nodemailer from 'nodemailer';

//Create a transporter object
const createMailTransporter = () => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD, //app password
        },
    });
    return transporter;
}
export const sendVerificationMail = (email: string, emailToken: string, name:string) => {
    const transporter = createMailTransporter();

    const mailOptions = {
        from: {
            name: 'Taskify',
            address: process.env.EMAIL!
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
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

export const sendPasswordResetMail = (email: string, token: string)=>{
    const transporter = createMailTransporter();

    const mailOptions ={
        from:{
            name: 'Taskify',
            address: process.env.EMAIL!
        },
        to: email,
        subject: "Reset your password for Taskify",
        html: `<p>Hello 👋,</p>
        </p>Click on the link below to reset your password for Taskify:</p>
        <a href=https://taskify-lac-beta.vercel.app/forgot-password?token=${token}'>Reset Your Password</a>,
        <p>If you didn't ask to reset your password, you can ignore this email.</p>
        <p>Thanks,</p>
        <p>Taskify Team</p>`
    }

    transporter.sendMail(mailOptions, (error, info)=>{
        if (error){
            console.log(error);
        } else{
            console.log('Email sent: ' + info.response)
        }
    })
}