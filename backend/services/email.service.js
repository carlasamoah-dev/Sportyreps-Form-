const { Resend } = require('resend');
const env = require('../config/env');
const logger = require('../utils/logger');

const resend = new Resend(env.RESEND_API_KEY);

const sendNotificationEmail = async (submissionData, fileUrls) => {
  if (!env.RESEND_API_KEY) {
    logger.warn("No RESEND_API_KEY provided. Skipping email notification.");
    return;
  }

  // Determine the name to show based on logic path
  let applicantName = "Applicant";
  if (submissionData['talent-contact_firstname']) {
    applicantName = `${submissionData['talent-contact_firstname']} ${submissionData['talent-contact_lastname']}`;
  } else if (submissionData['talent-info-for-rep_firstname']) {
    applicantName = `${submissionData['talent-info-for-rep_firstname']} ${submissionData['talent-info-for-rep_lastname']}`;
  }

  const htmlContent = `
    <h2>New Football Talent Submission</h2>
    <p>A new application has been submitted by <strong>${applicantName}</strong>.</p>
    <ul>
      <li><strong>Role:</strong> ${submissionData.role}</li>
      <li><strong>Age:</strong> ${submissionData.age}</li>
      <li><strong>Position:</strong> ${submissionData.position}</li>
      <li><strong>Country of Residence:</strong> ${submissionData.residence}</li>
      <li><strong>YouTube Link:</strong> <a href="${submissionData['youtube-link']}">${submissionData['youtube-link']}</a></li>
    </ul>
    <h3>Uploaded Files</h3>
    <ul>
      ${fileUrls.cv ? `<li><a href="${fileUrls.cv}">Football CV</a></li>` : '<li>No CV uploaded</li>'}
      ${fileUrls.portrait ? `<li><a href="${fileUrls.portrait}">Portrait Photo</a></li>` : ''}
      ${fileUrls.front ? `<li><a href="${fileUrls.front}">Front View Photo</a></li>` : ''}
      ${fileUrls.rear ? `<li><a href="${fileUrls.rear}">Rear View Photo</a></li>` : ''}
    </ul>
    <p>Log in to your Supabase or Admin Dashboard to view full details.</p>
  `;

  try {
    await resend.emails.send({
      from: 'Sportyreps <onboarding@resend.dev>', // Update this with verified domain later
      to: [env.ADMIN_EMAIL],
      subject: `New Application: ${applicantName}`,
      html: htmlContent,
    });
    logger.info(`Email notification sent for submission from ${applicantName}`);
  } catch (error) {
    logger.error(`Failed to send email notification: ${error.message}`);
    // We don't throw here to avoid failing the user's request if just the email fails
  }
};

module.exports = {
  sendNotificationEmail,
};
