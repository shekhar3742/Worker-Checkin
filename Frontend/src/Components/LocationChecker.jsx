import { useState } from "react";

function CheckIn() {
  const [message, setMessage] = useState("");

  const handleCheckIn = () => {
    setMessage("Getting location...");

    let readings = [];

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords = pos.coords;
        readings.push(coords);

        // If first reading is very accurate → use immediately
        if (coords.accuracy <= 20 && readings.length === 1) {
          finish(coords);
          return;
        }

        // Otherwise take max 2 readings
        if (readings.length >= 2) {
          const best = readings.sort((a, b) => a.accuracy - b.accuracy)[0];
          finish(best);
        }
      },
      () => {
        setMessage("❌ Location permission denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 4000,
      }
    );

    function finish(bestCoords) {
      navigator.geolocation.clearWatch(watchId);

      sendToServer(bestCoords);
    }

    async function sendToServer(coords) {
      try {
        setMessage("Verifying location...");

        const response = await fetch(
          "https://worker-checkin.onrender.com/checkin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy,
            }),
          }
        );

        const data = await response.json();

        setMessage(data.message);
      } catch {
        setMessage("❌ Server error");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Worker Check-In</h2>

      <button onClick={handleCheckIn}>
        Check In
      </button>

      <p>{message}</p>
    </div>
  );
}

export default CheckIn;