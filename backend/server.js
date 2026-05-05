const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/masjid-admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const prayerTimesSchema = new mongoose.Schema({
  fajr: String,
  dhuhr: String,
  asr: String,
  maghrib: String,
  isha: String,
});

const announcementSchema = new mongoose.Schema({
  title: String,
  body: String,
  date: { type: Date, default: Date.now },
});

const donationSchema = new mongoose.Schema({
  amount: Number,
  note: String,
  date: { type: Date, default: Date.now },
});

const PrayerTimes = mongoose.model('PrayerTimes', prayerTimesSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const Donation = mongoose.model('Donation', donationSchema);

// Routes

// Prayer Times
app.get('/api/prayer-times', async (req, res) => {
  try {
    let times = await PrayerTimes.findOne();
    if (!times) {
      // Default times
      times = new PrayerTimes({
        fajr: '05:18',
        dhuhr: '12:38',
        asr: '15:55',
        maghrib: '18:34',
        isha: '19:46',
      });
      await times.save();
    }
    res.json(times);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/prayer-times', async (req, res) => {
  try {
    const times = await PrayerTimes.findOneAndUpdate({}, req.body, { 
      new: true, 
      upsert: true 
    });
    res.json(times);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Donations
app.get('/api/donations', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ date: -1 });
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    res.json({ history: donations, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    
    // Recalculate total
    const allDonations = await Donation.find();
    const total = allDonations.reduce((sum, d) => sum + d.amount, 0);
    
    res.json({ donation, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/donations', async (req, res) => {
  try {
    await Donation.deleteMany({});
    res.json({ message: 'All donations reset', total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});