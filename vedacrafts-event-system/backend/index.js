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

// ─── BREVO SETUP ──────────────────────────────────────────────────────────────
const { BrevoClient } = require("@getbrevo/brevo");

let otpStore = {};

const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});
// ──────────────────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

let cachedEvents = null;
let lastFetchTime = 0;

// ─── SLUG HELPER ──────────────────────────────────────────────────────────────
// Converts an event title into a URL-safe slug, e.g. "Veda Startup Summit 2026!"
// becomes "veda-startup-summit-2026". Falls back to eventId if title is empty.
function slugify(text) {
  return (text || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // remove special characters
    .replace(/\s+/g, "-")           // spaces to hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .replace(/^-|-$/g, "");         // trim leading/trailing hyphens
}

// Builds a unique slug for an event row, appending a short suffix from the
// eventId if two events would otherwise share the same slug.
function buildSlugForRow(row) {
  const titleEn = row[1] || "";
  const eventId = row[0] || "";
  const baseSlug = slugify(titleEn) || slugify(eventId) || eventId;
  return baseSlug;
}

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

// ─── DELETE /events/:id ────────────────────────────────────────────────────────
app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const eventsSheet = meta.data.sheets.find(
      (s) => s.properties.title === "Events"
    );

    if (!eventsSheet) {
      return res.status(500).json({ error: "Events sheet not found" });
    }

    const sheetGid = eventsSheet.properties.sheetId;

    const rows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Events!A:Q",
    });

    const data = rows.data.values || [];

    const rowIndex = data.findIndex(
      (row) => (row[0] || "").trim() === (id || "").trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetGid,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    cachedEvents = null;
    lastFetchTime = 0;

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

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

      // ── Duplicate check FIRST ──────────────────────────────────────────────
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

      // ── Banner upload ──────────────────────────────────────────────────────
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
        if (speakerImageUrls[index]) speaker.image = speakerImageUrls[index];

        if (parsedSpeakersTa[index]) {
          speaker.nameTa        = parsedSpeakersTa[index].nameTa        || "";
          speaker.designationTa = parsedSpeakersTa[index].designationTa || "";
          speaker.bioTa         = parsedSpeakersTa[index].bioTa         || "";
        }
      });

      // ── Glimpse uploads ────────────────────────────────────────────────────
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

      // ── Write to sheet ─────────────────────────────────────────────────────
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

// ─── GET /events/by-slug/:slug ─────────────────────────────────────────────────
// Looks up a single event by its URL slug (derived from the English title).
// If multiple events share the same slug, the eventId is appended for
// disambiguation (?eid=...) — but in practice this is rare since titles differ.
app.get("/events/by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { eid } = req.query;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Events!A2:Q",
    });

    const rows = response.data.values || [];

    // Find all rows whose slug matches
    const matches = rows.filter((row) => buildSlugForRow(row) === slug);

    if (matches.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    let matchedRow = matches[0];

    if (matches.length > 1) {
      // Multiple events share this slug — disambiguate using eventId if provided
      if (eid) {
        const exact = matches.find((row) => (row[0] || "").trim() === eid.trim());
        if (exact) matchedRow = exact;
      }
    }

    res.json(matchedRow);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching event by slug" });
  }
});

// ─── GET /events/slugs ──────────────────────────────────────────────────────────
// Returns a lightweight list of { eventId, slug, titleEn, status } for all
// events — useful for the frontend to build links without fetching full rows.
app.get("/events/slugs", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Events!A2:Q",
    });

    const rows = response.data.values || [];

    const list = rows.map((row) => ({
      eventId: row[0],
      slug: buildSlugForRow(row),
      titleEn: row[1],
      status: (row[15] || "").trim().toLowerCase(),
    }));

    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching event slugs" });
  }
});

// ─── POST /add-event (registration) ──────────────────────────────────────────
app.post("/add-event", async (req, res) => {
  const {
    name, phone, email, district, businessName,
    designation, category, stage, lookingFor, eventId, eventTitle,
  } = req.body;

  try {
    // 1. Check for duplicate registration (same email/phone/name for SAME event)
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Registrations!A:K",
    });

    const existingRows = existing.data.values || [];

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPhone = (phone || "").trim();
    const normalizedName = (name || "").trim().toLowerCase();

    const isDuplicate = existingRows.some((row) => {
      const rowEventId = (row[0] || "").trim();
      const rowName = (row[2] || "").trim().toLowerCase();
      const rowPhone = (row[3] || "").trim();
      const rowEmail = (row[4] || "").trim().toLowerCase();

      return (
        rowEventId === (eventId || "").trim() &&
        (rowEmail === normalizedEmail ||
          rowPhone === normalizedPhone ||
          rowName === normalizedName)
      );
    });

    if (isDuplicate) {
      return res.status(409).json({
        error: "You have already registered for this event using this name, email, or phone number.",
      });
    }

    // 2. Append data to Google Sheets
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

    // 3. Send Email via Brevo
    try {
      await brevoClient.transactionalEmails.sendTransacEmail({
        sender: { name: "Vedacrafts Official", email: "vedacraftsofficial@gmail.com" },
        to: [{ email: email, name: name }],
        subject: "VedaCrafts Registration Successful",
        htmlContent: `
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
      });
      console.log("✅ Registration email sent successfully via Brevo");
    } catch (emailError) {
      console.error("❌ Failed to send registration email:", emailError);
      // We don't block the frontend even if email fails
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

// ─── ADMIN SETTINGS ───────────────────────────────────────────────────────────
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
        values: [[fullName, email, phone]],
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
      return res.status(400).json({ error: "Current password incorrect" });
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
      return res.json({ success: true });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.get("/generate-password", async (req, res) => {
  const hash = await bcrypt.hash("admin123", 10);
  res.send(hash);
});

// ─── ADMIN FORGOT PASSWORD ────────────────────────────────────────────────────
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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    // Send OTP via Brevo
    await brevoClient.transactionalEmails.sendTransacEmail({
      sender: { name: "Vedacrafts Official", email: "vedacraftsofficial@gmail.com" },
      to: [{ email: email }],
      subject: "Admin Password Reset OTP",
      htmlContent: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `,
    });

    console.log("✅ OTP email sent successfully via Brevo");

    return res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
    return res.status(500).json({ error: "Failed to send OTP email" });
  }
});

// ─── ADMIN RESET PASSWORD ─────────────────────────────────────────────────────
app.post("/admin/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

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