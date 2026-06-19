const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require("dotenv").config();

const bcrypt = require("bcrypt");

const express = require("express");
const cors = require("cors");
const { sheets, spreadsheetId } = require("./config/googleSheets");

const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("./config/cloudinary");

// ─── NODEMAILER CONFIGURATION (REPLACED RESEND) ──────────────────────────────
const nodemailer = require("nodemailer");

let otpStore = {};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS-க்கு false இருக்கணும், Render-ல இதான் ஒர்க் ஆகும்
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// ──────────────────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

let cachedEvents = null;
let lastFetchTime = 0;

// ─── PUT /events/:id/status ───────────────────────────────────────────────────
app.put("/events/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("STATUS UPDATE:", id, "→", status);

    const rows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Events!A:Q",
    });

    const data = rows.data.values || [];

    const rowIndex = data.findIndex(
      (row) => (row[0] || "").trim() === (id || "").trim()
    );

    if (rowIndex === -1) {
      console.log("EVENT NOT FOUND:", id);
      return res.status(404).json({ error: "Event not found" });
    }

    const sheetRow = rowIndex + 1;

    console.log("rowIndex:", rowIndex, "→ writing to sheet row:", sheetRow);

    const existingRow = [...data[rowIndex]];
    existingRow[15] = status;

    while (existingRow.length < 17) existingRow.push("");

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Events!A${sheetRow}:Q${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [existingRow] },
    });

    console.log("STATUS UPDATED SUCCESSFULLY on sheet row", sheetRow);

    cachedEvents = null;
    lastFetchTime = 0;

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// ─── PUT /events/:id/edit ─────────────────────────────────────────────────────
app.put(
  "/events/:id/edit",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "speakerImages", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const rows = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Events!A:Q",
      });
      const data = rows.data.values || [];

      const rowIndex = data.findIndex(
        (row) => (row[0] || "").trim() === (id || "").trim()
      );

      if (rowIndex === -1) {
        return res.status(404).json({ message: "Event not found" });
      }

      const sheetRow = rowIndex + 1;

      const {
        titleEn, titleTa, type, date, time,
        venueEn, venueTa, seats, district, deadline,
        descriptionEn, descriptionTa,
        speakersdetailsEn, speakersdetailsTa,
        status,
      } = req.body;

      // ── Banner upload ──────────────────────────────────────────────────────
      let bannerUrl = data[rowIndex][16] || "";
      if (req.files?.banner?.[0]) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "vedacraft-events" },
            (error, result) => { if (error) reject(error); else resolve(result); }
          );
          streamifier.createReadStream(req.files.banner[0].buffer).pipe(stream);
        });
        bannerUrl = result.secure_url;
      }

      // ── Speaker image uploads ──────────────────────────────────────────────
      const speakerImageUrls = [];
      if (req.files?.speakerImages) {
        for (const file of req.files.speakerImages) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "vedacraft-speakers" },
              (error, result) => { if (error) reject(error); else resolve(result); }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
          speakerImageUrls.push(result.secure_url);
        }
      }

      // ── Parse & merge speaker details ──────────────────────────────────────
      const parsedSpeakersEn = JSON.parse(speakersdetailsEn || "[]");
      const parsedSpeakersTa = JSON.parse(speakersdetailsTa || "[]");

      parsedSpeakersEn.forEach((speaker, index) => {
        if (speakerImageUrls[index]) {
          speaker.image = speakerImageUrls[index];
        } else if (data[rowIndex][13]) {
          try {
            const existing = JSON.parse(data[rowIndex][13] || "[]");
            if (existing[index]?.image) speaker.image = existing[index].image;
          } catch (_) {}
        }

        if (parsedSpeakersTa[index]) {
          speaker.nameTa        = parsedSpeakersTa[index].nameTa        || "";
          speaker.designationTa = parsedSpeakersTa[index].designationTa || "";
          speaker.bioTa         = parsedSpeakersTa[index].bioTa         || "";
        }
      });

      // ── Write to sheet ─────────────────────────────────────────────────────
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Events!A${sheetRow}:Q${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            id,
            titleEn,
            titleTa,
            type,
            date,
            time,
            venueEn,
            venueTa,
            seats,
            district,
            deadline,
            descriptionEn,
            descriptionTa,
            JSON.stringify(parsedSpeakersEn),
            JSON.stringify(parsedSpeakersTa),
            status || data[rowIndex][15],
            bannerUrl,
          ]],
        },
      });

      cachedEvents = null;
      lastFetchTime = 0;

      res.json({ success: true });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

// ─── POST /events ─────────────────────────────────────────────────────────────
app.post(
  "/events",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "speakerImages", maxCount: 20 },
    { name: "glimpses", maxCount: 30 },
  ]),
  async (req, res) => {
    try {
      const {
        eventId, titleEn, titleTa, type, date, time,
        venueEn, venueTa, seats, district, deadline,
        descriptionEn, descriptionTa,
        speakersdetailsEn, speakersdetailsTa,
        status,
      } = req.body;

      const rows = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Events!A:Q",
      });
      const data = rows.data.values || [];
      const exists = data.find(
        (row) => (row[0] || "").trim() === (eventId || "").trim()
      );
      if (exists) {
        return res.status(400).json({ error: "Event already exists" });
      }

      let bannerUrl = "";
      if (req.files?.banner?.[0]) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "vedacraft-events" },
            (error, result) => { if (error) reject(error); else resolve(result); }
          );
          streamifier.createReadStream(req.files.banner[0].buffer).pipe(stream);
        });
        bannerUrl = result.secure_url;
      }

      const speakerImageUrls = [];
      if (req.files?.speakerImages) {
        for (const file of req.files.speakerImages) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "vedacraft-speakers" },
              (error, result) => { if (error) reject(error); else resolve(result); }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
          speakerImageUrls.push(result.secure_url);
        }
      }

      const parsedSpeakersEn = JSON.parse(speakersdetailsEn || "[]");
      const parsedSpeakersTa = JSON.parse(speakersdetailsTa || "[]");

      parsedSpeakersEn.forEach((speaker, index) => {
        if (speakerImageUrls[index]) speaker.image = speakerImageUrls[index];

        if (parsedSpeakersTa[index]) {
          speaker.nameTa        = parsedSpeakersTa[index].nameTa        || "";
          speaker.designationTa = parsedSpeakersTa[index].designationTa || "";
          speaker.bioTa         = parsedSpeakersTa[index].bioTa         || "";
        }
      });

      const glimpseUrls = [];
      if (req.files?.glimpses) {
        for (const file of req.files.glimpses) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "vedacraft-glimpses" },
              (error, result) => { if (error) reject(error); else resolve(result); }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
          glimpseUrls.push(result.secure_url);
        }
      }

      for (const url of glimpseUrls) {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Glimpses!A:B",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[eventId, url]] },
        });
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Events!A:Q",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            eventId,
            titleEn,
            titleTa,
            type,
            date,
            time,
            venueEn,
            venueTa,
            seats,
            district,
            deadline,
            descriptionEn,
            descriptionTa,
            JSON.stringify(parsedSpeakersEn),
            JSON.stringify(parsedSpeakersTa),
            status,
            bannerUrl,
          ]],
        },
      });

      cachedEvents = null;
      lastFetchTime = 0;

      res.send("Event saved successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Error saving event");
    }
  }
);

// ─── GET /events ──────────────────────────────────────────────────────────────
app.get("/events", async (req, res) => {
  try {
    const now = Date.now();
    const bustCache = !!req.query.t;

    if (!bustCache && cachedEvents && now - lastFetchTime < 10000) {
      return res.json(cachedEvents);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Events!A2:Q",
    });

    const rows = response.data.values || [];

    cachedEvents = rows;
    lastFetchTime = now;

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching events");
  }
});

// ─── POST /add-event (registration) USING NODEMAILER ──────────────────────────
app.post("/add-event", async (req, res) => {
  const {
    name, phone, email, district, businessName,
    designation, category, stage, lookingFor, eventId, eventTitle,
  } = req.body;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Registrations!A:K",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          eventId, eventTitle, name, phone, email,
          district, businessName, designation, category,
          stage, lookingFor?.join(",") || "",
        ]],
      },
    });

    // Send Email via Nodemailer
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "VedaCrafts Registration Successful",
        html: `
          <h2>Registration Confirmed 🎉</h2>
          <p>Hello ${name},</p>
          <p>Your registration has been confirmed.</p>
          <hr/>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>District:</strong> ${district}</p>
          <br/>
          <p>Thank you for registering with VedaCrafts.</p>
          <p>Team VedaCrafts</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Registration email sent successfully via Nodemailer");
    } catch (emailError) {
      console.error("❌ Failed to send registration email:", emailError);
    }

    return res.status(200).json({ success: true, message: "Registration successful" });

  } catch (err) {
    console.error("❌ Complete registration workflow crash:", err);
    return res.status(500).json({ error: "Registration Failed" });
  }
});

// ─── GET /registrations ───────────────────────────────────────────────────────
app.get("/registrations", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Registrations!A:K",
    });
    res.json(response.data.values || []);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// ─── GET /glimpses ────────────────────────────────────────────────────────────
app.get("/glimpses", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Glimpses!A2:B",
    });
    res.json(response.data.values || []);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch glimpses" });
  }
});

// ADMIN/SETTINGS
app.get("/admin/settings", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "AdminSettings!A2:D2",
    });

    const row = response.data.values?.[0] || [];

    res.json({
      fullName: row[0] || "",
      email: row[1] || "",
      phone: row[2] || "",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.put("/admin/settings", async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "AdminSettings!A2:D2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[fullName, email, phone ]],
      },
    });

    const auth = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
    });

    const row = auth.data.values?.[0] || [];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[email, row[1]]],
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.put("/admin/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
    });

    const row = response.data.values?.[0] || [];

    console.log("CURRENT:", currentPassword);
    console.log("HASH:", row[1]);

    const isMatch = await bcrypt.compare(currentPassword, row[1]);

    if (!isMatch) {
      return res.status(400).json({
        error: "Current password incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[row[0], hashedPassword]],
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
    });

    const row = response.data.values?.[0] || [];

    const savedEmail = row[0];
    const savedPassword = row[1];

    const isMatch = await bcrypt.compare(password, savedPassword);

    if (email === savedEmail && isMatch) {
      return res.json({
        success: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.get("/generate-password", async (req, res) => {
  const hash = await bcrypt.hash("admin123", 10);
  res.send(hash);
});

// ─── POST /admin/forgot-password USING NODEMAILER ─────────────────────────────
app.post("/admin/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
    });

    const row = response.data.values?.[0] || [];
    const savedEmail = row[0];

    if (email !== savedEmail) {
      return res.status(400).json({ error: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    // Send via Nodemailer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, 
      subject: "Admin Password Reset OTP",
      html: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully via Nodemailer");
    
    return res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (emailError) {
    console.error("❌ Failed to send OTP email:", emailError);
    return res.status(500).json({ error: "Failed to send OTP email" });
  }
});

app.post("/admin/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ error: "OTP not requested" });
    }

    if (Date.now() > record.expires) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp != otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
    });

    const row = response.data.values?.[0] || [];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "AdminAuth!A2:B2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[row[0], hashedPassword]],
      },
    });

    delete otpStore[email];

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Reset failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});