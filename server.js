const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Serve index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Live Mock Flight Search API
app.post('/api/flights/search', (req, res) => {
  const { origin, destination, departureDate, passengers } = req.body;
  const paxCount = parseInt(passengers) || 1;

  const sampleFlights = [
    {
      id: 'FL-6E-521',
      airline: 'IndiGo',
      flightNo: '6E-521',
      from: origin || 'GAU',
      to: destination || 'DEL',
      depTime: '06:30',
      arrTime: '09:15',
      duration: '2h 45m',
      date: departureDate || '2026-09-10',
      price: 4404 * paxCount
    },
    {
      id: 'FL-AI-890',
      airline: 'Air India',
      flightNo: 'AI-890',
      from: origin || 'GAU',
      to: destination || 'DEL',
      depTime: '11:45',
      arrTime: '14:20',
      duration: '2h 35m',
      date: departureDate || '2026-09-10',
      price: 4850 * paxCount
    },
    {
      id: 'FL-QP-133',
      airline: 'Akasa Air',
      flightNo: 'QP-133',
      from: origin || 'GAU',
      to: destination || 'DEL',
      depTime: '16:00',
      arrTime: '18:40',
      duration: '2h 40m',
      date: departureDate || '2026-09-10',
      price: 4199 * paxCount
    },
    {
      id: 'FL-SG-612',
      airline: 'SpiceJet',
      flightNo: 'SG-612',
      from: origin || 'GAU',
      to: destination || 'DEL',
      depTime: '20:10',
      arrTime: '22:55',
      duration: '2h 45m',
      date: departureDate || '2026-09-10',
      price: 3950 * paxCount
    }
  ];

  res.json({ success: true, flights: sampleFlights });
});

app.listen(PORT, () => {
  console.log(`SkyVoyage server live on port ${PORT}`);
});
