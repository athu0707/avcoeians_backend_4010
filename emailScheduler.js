const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Event = require('./models/Event');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/events', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Setup Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'atharvmulay07@gmail.com',
    pass: 'igwtfxrikidmcayc',
  },
});

// Function to send email
const sendEmailReminder = async (event) => {
  const mailOptions = {
    from: 'atharvmulay07@gmail.com',
    to: 'madhavijoashi2021@gmail.com',
    subject: `⏰ Reminder: ${event.name}`,
    text: `📅 Event: ${event.name}\n🗓 Date: ${new Date(event.date).toLocaleDateString()}\n📋 Details: ${event.description}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent for: ${event.name}`);
    event.emailReminderSent = true;
    await event.save(); // Mark as sent
  } catch (err) {
    console.error(`❌ Failed to send email for ${event.name}:`, err);
  }
};

// MAIN FUNCTION: Get latest event and send email
const runScheduler = async () => {
  try {
    const latestEvent = await Event.findOne({ emailReminderSent: false }).sort({ _id: -1 });

    if (latestEvent) {
      await sendEmailReminder(latestEvent);
    } else {
      console.log('🛑 No new events to send.');
    }
  } catch (err) {
    console.error('❌ Scheduler error:', err);
  } finally {
    mongoose.connection.close();
  }
};

runScheduler();
