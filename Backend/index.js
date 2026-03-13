const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health route (for uptime monitoring)
app.get("/", (req, res) => {
  res.send("Worker Check-in Server Running");
});

// Site location (fixed)
const SITE_LOCATION = {
  latitude: 28.601175031191868,
  longitude: 77.43218881247674,
};


const MAX_RADIUS = 20; // meters

// Haversine formula to calculate distance
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

// Check-in API
app.post("/checkin", (req, res) => {
  const { latitude, longitude, accuracy } = req.body;

  // Validate request data
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

  // Reject poor GPS accuracy
  if (accuracy > 40) {
    return res.json({
      success: false,
      message: "❌ GPS accuracy too low. Move to open area.",
      accuracy,
    });
  }

  // Calculate distance
  const distance = getDistance(
    SITE_LOCATION.latitude,
    SITE_LOCATION.longitude,
    latitude,
    longitude
  );

  // Accuracy weighted distance
  const effectiveDistance = distance - accuracy / 2;

  console.log({
    latitude,
    longitude,
    accuracy,
    distance,
    effectiveDistance,
  });

  // Geofence check
  if (effectiveDistance <= MAX_RADIUS) {
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