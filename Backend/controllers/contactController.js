const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

exports.submitContact = async (req, res) => {
  try {
    const { name, email, type, message } = req.body;

    // Validation
    if (!name || !email || !type || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const validTypes = ['query', 'suggestion', 'bug', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid submission type" });
    }

    // Save to DB
    const contact = await Contact.create({ name, email, type, message });

    // Forward inquiry via email
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const targetEmail = process.env.CONTACT_RECEIVER_EMAIL || smtpUser || "support.podium@gmail.com";

    let emailSent = false;
    let emailError = null;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport(
          smtpHost === 'smtp.gmail.com'
            ? {
                service: 'gmail',
                auth: { user: smtpUser, pass: smtpPass },
              }
            : {
                host: smtpHost,
                port: parseInt(smtpPort),
                secure: parseInt(smtpPort) === 465,
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
              }
        );

        const mailOptions = {
          from: `"${name} (via Podium)" <${smtpUser}>`,
          to: targetEmail,
          replyTo: email,
          subject: `[Podium Contact Form] New ${type.toUpperCase()}: ${name}`,
          text: `You have received a new message from the Podium Contact Form.\n\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Type: ${type}\n\n` +
                `Message:\n${message}\n`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #171E2E; background-color: #FAF7F0;">
              <h2 style="border-bottom: 2px solid #F2B84B; padding-bottom: 10px; color: #0F1420;">New Podium Inquiry</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Type:</strong> <span style="background-color: #F2B84B; padding: 3px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 11px; color: #0F1420;">${type}</span></p>
              <div style="margin-top: 20px; padding: 15px; background-color: rgba(255,255,255,0.7); border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin-top: 30px;" />
              <p style="font-size: 11px; color: #8B93A7; text-align: center;">Sent via Podium Mock Interview platform.</p>
            </div>
          `,
        };

        const confirmationMailOptions = {
          from: `"Podium Support" <${smtpUser}>`,
          to: email,
          subject: `We've received your inquiry: ${type.toUpperCase()}`,
          text: `Hi ${name},\n\n` +
                `Thank you for reaching out to Podium! We have successfully received your inquiry.\n\n` +
                `Here are the details we received:\n` +
                `- Name: ${name}\n` +
                `- Inquiry Type: ${type.toUpperCase()}\n` +
                `- Message:\n${message}\n\n` +
                `Our team will review your submission and get back to you as soon as possible.\n\n` +
                `Best regards,\n` +
                `The Podium Team`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #171E2E; background-color: #FAF7F0;">
              <h2 style="border-bottom: 2px solid #F2B84B; padding-bottom: 10px; color: #0F1420;">We've received your inquiry!</h2>
              <p>Hi ${name},</p>
              <p>Thank you for reaching out to Podium. We have received your submission and our team will get back to you as soon as possible.</p>
              <div style="margin-top: 20px; padding: 15px; background-color: rgba(255,255,255,0.7); border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; color: #0F1420; font-size: 14px;">Submission Details</h3>
                <p><strong>Type:</strong> <span style="background-color: #F2B84B; padding: 3px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 11px; color: #0F1420;">${type}</span></p>
                <p style="white-space: pre-wrap; margin: 0; color: #4A5568;">${message}</p>
              </div>
              <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin-top: 30px;" />
              <p style="font-size: 11px; color: #8B93A7; text-align: center;">This is an automated confirmation of receipt from Podium.</p>
            </div>
          `,
        };

        // Verify the SMTP connection/credentials and send emails in the background
        // so that slow DNS lookups or firewall blocks do not delay the API response.
        transporter.verify().then(() => {
          transporter.sendMail(mailOptions).then((supportInfo) => {
            console.log(`Support notification email successfully sent to ${targetEmail}. Message ID: ${supportInfo.messageId}. Response: ${supportInfo.response}`);
            
            transporter.sendMail(confirmationMailOptions).then((confirmationInfo) => {
              console.log(`Confirmation receipt email successfully sent to ${email}. Message ID: ${confirmationInfo.messageId}. Response: ${confirmationInfo.response}`);
            }).catch((confirmErr) => {
              console.error("Nodemailer error sending user confirmation email:", confirmErr.message);
            });
          }).catch((sendErr) => {
            console.error("Nodemailer error sending support notification email:", sendErr.message);
          });
        }).catch((verifyErr) => {
          console.error("Nodemailer SMTP verification failed in background:", verifyErr.message);
        });

        emailSent = true;
      } catch (err) {
        console.error("Nodemailer error preparing email transport:", err.message);
        emailError = err.message;
      }
    } else {
      console.warn("SMTP credentials not configured. Contact saved but email not forwarded via SMTP.");
      emailError = "SMTP credentials not configured on the server.";
    }

    res.status(201).json({
      message: "Inquiry submitted successfully.",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        type: contact.type,
        message: contact.message,
        createdAt: contact.createdAt
      },
      emailSent,
      emailError
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
