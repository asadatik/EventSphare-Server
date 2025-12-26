const nodemailer = require("nodemailer");

const sendReminderEmail = async (userEmail, eventName, eventDate) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `EventSphere <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Reminder: Upcoming Event - ${eventName}`,
        html: `
            <div>
                <h2>Hi there!</h2>
                <p>This is a friendly reminder that your event <strong>${eventName}</strong> is happening tomorrow on <strong>${new Date(eventDate).toLocaleString()}</strong>.</p>
                <p>We look forward to seeing you!</p>
                <p>Best regards,<br>The EventSphere Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${userEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendReminderEmail};