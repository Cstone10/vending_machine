// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check (useful after deploy)
app.get('/health', (req, res) => res.send('OK'));

// Form POST endpoint
app.post('/send', async (req, res) => {
  try {
    const { business, email, phone, message } = req.body;

    if (!business || !email || !message) {
      return res.status(400).send('Missing required fields.');
    }

    // Use SendGrid SMTP (recommended for production)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false, // true for 465
      auth: {
        user: process.env.SMTP_USER, // often "apikey" for SendGrid SMTP
        pass: process.env.SMTP_PASS, // your SendGrid API key (or SMTP password)
      },
    });

    const mailOptions = {
      from: `${business} <${email}>`,
      to: process.env.CONTACT_EMAIL, // your inbox for requests
      subject: `New Vending Request — ${business}`,
      text: `
Business Name: ${business}
Email: ${email}
Phone: ${phone || 'N/A'}
Message: ${message}
      `,
      html: `<h3>New Vending Request</h3>
<ul>
  <li><strong>Business:</strong> ${business}</li>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>Phone:</strong> ${phone || 'N/A'}</li>
</ul>
<p><strong>Message:</strong><br/>${message}</p>`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).send('Your request has been sent. Thank you!');
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).send('Something went wrong sending the email.');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
