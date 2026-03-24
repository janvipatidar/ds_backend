const express = require("express");
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
require("dotenv").config();
const multer = require("multer");
const fs = require("fs");
const nodemailer = require("nodemailer")
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/apply", upload.single("resume"), async (req, res) => {
    try {
        const { name, email, phone, profile, currentLocation, preferredLocations, message } = req.body;
        const resume = req.file;
        const preferredLocation = JSON.parse(preferredLocations);
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        })
        await transporter.sendMail({
            from: `"Job Portal" <${process.env.SMTP_EMAIL}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: `New Job Application - ${profile}`,
            html: `
         <h3>New Job Application</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Profile:</b> ${profile}</p>
        <p><b>Current Location:</b> ${currentLocation}</p>
        <p><b>Preferred Locations:</b> ${preferredLocation.join(", ")}</p>
        <p><b>Message:</b> ${message || "-"}</p>
      `,
            attachments: [
                {
                    filename: resume.originalname,
                    path: resume.path,
                },
            ],
        });

        fs.unlinkSync(resume.path);

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send email" });
    }
})


app.post("/api/v1/contact", async (req, res) => {
  try {
    console.log("req body:", req.body);

    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"Job Portal" <${process.env.SMTP_EMAIL}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `Contact By - ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


app.get("/", (req, res) => res.send("Job API Running 🚀"));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));