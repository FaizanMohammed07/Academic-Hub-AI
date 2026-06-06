const nodemailer = require('nodemailer');
const config = require('../../../config');
const logger = require('../../../shared/utils/logger');

const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  auth: { user: config.email.smtp.user, pass: config.email.smtp.pass },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${config.email.fromName}" <${config.email.from}>`,
      to,
      subject,
      html,
    });
    logger.debug(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
  }
};

const sendPasswordReset = (email, name, otp) =>
  sendMail({
    to: email,
    subject: 'VJIT IT Hub — Password Reset OTP',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>Your OTP is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p>
      <p>This OTP expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, ignore this email.</p>
      <br/><p>— VJIT IT Academic Hub</p>
    `,
  });

const sendAssignmentCreated = (email, name, assignmentTitle, deadline) =>
  sendMail({
    to: email,
    subject: `New Assignment: ${assignmentTitle}`,
    html: `
      <h2>New Assignment Posted</h2>
      <p>Hi ${name},</p>
      <p>A new assignment <strong>${assignmentTitle}</strong> has been posted.</p>
      <p>Deadline: <strong>${new Date(deadline).toLocaleString('en-IN')}</strong></p>
      <p>Log in to VJIT IT Hub to view your assignment.</p>
    `,
  });

const sendSubmissionGraded = (email, name, assignmentTitle, marks, maxMarks) =>
  sendMail({
    to: email,
    subject: `Graded: ${assignmentTitle}`,
    html: `
      <h2>Assignment Graded</h2>
      <p>Hi ${name},</p>
      <p>Your submission for <strong>${assignmentTitle}</strong> has been evaluated.</p>
      <p>Score: <strong>${marks} / ${maxMarks}</strong></p>
      <p>Log in to view detailed feedback.</p>
    `,
  });

module.exports = { sendMail, sendPasswordReset, sendAssignmentCreated, sendSubmissionGraded };
