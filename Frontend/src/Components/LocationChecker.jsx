import { useState } from "react";

function CheckIn() {
  const [message, setMessage] = useState("");

  // Get location promise
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 2000,
        }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      setMessage("Getting location...");

      // Take 2 readings
      const loc1 = await getLocation();
      const loc2 = await getLocation();

      // Select better accuracy
      const location =
        loc1.accuracy < loc2.accuracy ? loc1 : loc2;

      const { latitude, longitude, accuracy } = location;

      setMessage("Verifying location...");

      const response = await fetch(
        "https://worker-checkin.onrender.com/checkin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
            accuracy,
          }),
        }
      );

      const data = await response.json();

      setMessage(
        `${data.message}`
      );
    } catch (error) {
      if (error.code === 1) {
        setMessage("❌ Location permission denied");
      } else if (error.code === 2) {
        setMessage("❌ Location unavailable");
      } else if (error.code === 3) {
        setMessage("❌ Location request timed out");
      } else {
        setMessage("❌ Error getting location");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Worker Check-In</h2>

      <button onClick={handleCheckIn}>Check In</button>

      <p>{message}</p>
    </div>
  );
}

export default CheckIn;