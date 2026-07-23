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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #111827; padding: 30px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; color: #111827; font-weight: 600; margin-top: 0; }
        .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .detail-row { margin-bottom: 12px; font-size: 15px; color: #374151; }
        .detail-row strong { color: #111827; display: inline-block; width: 140px; }
        .files-section { margin-top: 30px; }
        .files-section h3 { font-size: 16px; color: #111827; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .file-link { display: inline-block; margin: 0 10px 10px 0; padding: 8px 16px; background: #eff6ff; color: #2563eb; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #bfdbfe; }
        .action-container { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sportyreps Scouting</h1>
        </div>
        <div class="content">
          <p class="greeting">New Submission Received</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">A new application has just been submitted by <strong>${applicantName}</strong>. Here is a quick summary of their profile:</p>
          
          <div class="details-box">
            <div class="detail-row"><strong>Role:</strong> ${submissionData.role}</div>
            <div class="detail-row"><strong>Age:</strong> ${submissionData.age}</div>
            <div class="detail-row"><strong>Position:</strong> ${submissionData.position}</div>
            <div class="detail-row"><strong>Country:</strong> ${submissionData.residence}</div>
            <div class="detail-row" style="margin-bottom: 0;"><strong>YouTube:</strong> <a href="${submissionData['youtube-link']}" style="color: #2563eb;">View Highlight Reel</a></div>
          </div>

          <div class="files-section">
            <h3>Uploaded Files</h3>
            <div>
              ${fileUrls.cv ? `<a href="${fileUrls.cv}" class="file-link">📄 Football CV</a>` : ''}
              ${fileUrls.portrait ? `<a href="${fileUrls.portrait}" class="file-link">🖼️ Portrait Photo</a>` : ''}
              ${fileUrls.front ? `<a href="${fileUrls.front}" class="file-link">🖼️ Front View</a>` : ''}
              ${fileUrls.rear ? `<a href="${fileUrls.rear}" class="file-link">🖼️ Rear View</a>` : ''}
            </div>
          </div>

          <div class="action-container">
            <p style="color: #4b5563; font-size: 15px; margin-bottom: 20px;">Review the full application and all applicant details in the Admin Dashboard.</p>
            <a href="${env.ADMIN_DASHBOARD_URL}" class="btn">Open Admin Dashboard</a>
          </div>
        </div>
        <div class="footer">
          This is an automated message from your Sportyreps intake system.
        </div>
      </div>
    </body>
    </html>
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
