const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Event = require('./models/Event');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ Backend is live. Use /api/events');
});

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://admin:O9yrU2MDSyvCTf3w@event.dxdozoj.mongodb.net/events?retryWrites=true&w=majority&appName=event')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: 'degmpyvch',
  api_key: '551986489357477',
  api_secret: 'ONz3AqAOpU3vN733p4Zb228qfX8'
});

// ✅ Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'college-events',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ Create new event + send email
app.post('/api/events', async (req, res) => {
  const { name, date, description, to } = req.body;

  try {
    const newEvent = new Event({ name, date, description });
    await newEvent.save();

    console.log("🆕 Event created with ID:", newEvent._id.toString());

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'atharvmulay007@gmail.com',
        pass: 'bwxqyuszswopadcf'
      }
    });

    const mailOptions = {
      from: 'atharvmulay007@gmail.com',
      to: to, // ✅ Now dynamic email address
      subject: `📢 New Event: ${name}`,
      text: `📅 Date: ${date}\n📝 Description: ${description}`
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", to);

    await Event.findByIdAndUpdate(newEvent._id, {
      emailReminderSent: true
    });

    res.status(200).json({
      message: '✅ Event saved and email sent successfully!',
      eventId: newEvent._id.toString()
    });

  } catch (err) {
    console.error("❌ Error saving event or sending email:", err);
    res.status(500).json({ error: "Failed to save event or send email." });
  }
});

// ✅ Upload image for existing event
app.post('/api/events/:eventId/image', upload.single('image'), async (req, res) => {
  const { eventId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded." });
  }

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { image: req.file.path },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json({
      message: "✅ Image uploaded and saved to event!",
      event: updatedEvent
    });
  } catch (err) {
    console.error("❌ Error uploading image:", err);
    res.status(500).json({ error: "Failed to upload image." });
  }
});

// ✅ Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
