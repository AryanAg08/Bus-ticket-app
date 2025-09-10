const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM, // your verified sender email
      subject,
      text,
      html,
      attachments,
    });
    console.log("✅ Email sent to", to);
  } catch (error) {
    console.error("❌ Email failed:", error.response?.body || error);
  }
};

module.exports = sendEmail;
