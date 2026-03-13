const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const SITE_LOCATION = {
  latitude: 28.60137272097046,
  longitude: 77.4294857065379,
};
 
const MAX_RADIUS = 20;

// Haversine Formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

app.post("/checkin", (req, res) => {
  const { latitude, longitude, accuracy } = req.body;

  if (
  latitude === undefined ||
  longitude === undefined ||
  accuracy === undefined
) {
    return res.status(400).json({
      success: false,
      message: "Invalid location data",
    });
  }

  const distance = getDistance(
    SITE_LOCATION.latitude,
    SITE_LOCATION.longitude,
    latitude,
    longitude
  );

  console.log({
    latitude,
    longitude,
    accuracy,
    distance,
  });

  if (accuracy <= 30 && distance <= MAX_RADIUS) {
    return res.json({
      success: true,
      message: "✅ Check-in allowed",
      distance,
      accuracy,
    });
  }

  return res.json({
    success: false,
    message: "❌ You are outside the 20m range",
    distance,
    accuracy,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});