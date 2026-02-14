const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // Define the email options
    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message.replace(/<[^>]*>/g, ''), // Plain text fallback
        html: options.message
    };

    // Send the email
    try {
        console.log(`[Email Debug] Attempting to send email to: ${options.email}`);
        console.log(`[Email Debug] SMTP Config: Host=${process.env.SMTP_HOST}, Port=${process.env.SMTP_PORT}, User=${process.env.SMTP_EMAIL}`);

        const info = await transporter.sendMail(mailOptions);
        console.log('[Email Debug] Message sent successfully. ID: %s', info.messageId);
    } catch (error) {
        console.error('[Email Debug] Error sending email via transporter:', error);
        throw error;
    }
};

module.exports = sendEmail;
