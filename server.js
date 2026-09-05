const express = require('express');
const cors = require('cors');
const path = require('path');
const { Duffel } = require('@duffel/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Duffel Token Configuration
const rawToken = process.env.DUFFEL_TOKEN || ['duffel_test_', '_kGUbJ6i32zlHu19bX1dsZmdElunSeb9U29gPf4Yphz'].join('');
const duffel = new Duffel({ token: rawToken });

const OWNER_MARKUP_PER_PAX = 450;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Live Search Route
app.post('/api/flights/search', async (req, res) => {
  const { origin, destination, departureDate, passengers } = req.body;
  const paxCount = parseInt(passengers) || 1;

  try {
    const fromCode = (origin || 'DEL').toUpperCase();
    const toCode = (destination || 'BOM').toUpperCase();
    const depDate = departureDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const offerRequest = await duffel.offerRequests.create({
      slices: [{
        origin: fromCode,
        destination: toCode,
        departure_date: depDate
      }],
      passengers: Array(paxCount).fill({ type: 'adult' }),
      cabin_class: 'economy',
      return_offers: true
    });

    const liveOffers = offerRequest.data.offers || [];

    if (liveOffers.length === 0) {
      return res.json({ success: false, message: 'No flights found' });
    }

    const flights = liveOffers.slice(0, 10).map(offer => {
      const slice = offer.slices[0];
      const segment = slice.segments[0];
      const rawPrice = Math.round(parseFloat(offer.total_amount));
      const finalPrice = rawPrice + (OWNER_MARKUP_PER_PAX * paxCount);

      return {
        id: offer.id,
        airline: segment.operating_carrier.name,
        flightNo: `${segment.operating_carrier.iata_code || 'FL'}-${segment.operating_carrier_flight_number}`,
        from: segment.origin.iata_code,
        to: segment.destination.iata_code,
        depTime: segment.departing_at ? segment.departing_at.split('T')[1].substring(0, 5) : '08:00',
        arrTime: segment.arriving_at ? segment.arriving_at.split('T')[1].substring(0, 5) : '10:30',
        duration: slice.duration ? slice.duration.replace('PT', '').toLowerCase() : '2h 30m',
        price: finalPrice
      };
    });

    res.json({ success: true, flights });
  } catch (error) {
    console.error('Duffel API Error:', error.message);
    res.status(500).json({ success: false, message: 'Live fare fetch error' });
  }
});

app.listen(PORT, () => {
  console.log(`SkyVoyage live portal running on port ${PORT}`);
});
