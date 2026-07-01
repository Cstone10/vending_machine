const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Route to handle form
app.post("/send", (req, res) => {
  const { business, email, phone, message } = req.body;

  // Configure transporter (use your email provider)
  let transporter = nodemailer.createTransport({
    service: "gmail", // You can use Gmail, Outlook, Yahoo, etc.
    auth: {
      user: "your-email@gmail.com", // <-- replace with your email
      pass: "your-app-password",    // <-- replace with email app password
    },
  });

  // Email content
  let mailOptions = {
    from: email,
    to: "your-email@gmail.com", // <-- where you want to receive requests
    subject: `New Vending Service Request from ${business}`,
    text: `
    Business Name: ${business}
    Email: ${email}
    Phone: ${phone}
    Message: ${message}
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send("Something went wrong. Please try again.");
    }
    res.send("Your request has been sent successfully! ✅");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));