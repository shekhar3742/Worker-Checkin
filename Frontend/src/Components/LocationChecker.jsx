import { useState } from "react";

function CheckIn() {
  const [message, setMessage] = useState("");

  const handleCheckIn = () => {
    setMessage("Getting location...");

    let readings = [];

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        readings.push(pos.coords);

        if (readings.length >= 3) {
          finishCollection();
        }
      },
      () => {
        setMessage("❌ Location permission denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 5000,
      }
    );

    // Force stop after 8 seconds
    const timeoutId = setTimeout(() => {
      finishCollection();
    }, 8000);

    async function finishCollection() {
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timeoutId);

      if (readings.length === 0) {
        setMessage("❌ Could not get location");
        return;
      }

      // Accuracy weighted average
      let totalWeight = 0;
      let latSum = 0;
      let lngSum = 0;
      let accuracySum = 0;

      readings.forEach((r) => {
        const weight = 1 / r.accuracy;

        totalWeight += weight;
        latSum += r.latitude * weight;
        lngSum += r.longitude * weight;
        accuracySum += r.accuracy;
      });

      const weightedLat = latSum / totalWeight;
      const weightedLng = lngSum / totalWeight;
      const avgAccuracy = accuracySum / readings.length;

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
              latitude: weightedLat,
              longitude: weightedLng,
              accuracy: avgAccuracy,
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

      <button onClick={handleCheckIn}>Check In</button>

      <p>{message}</p>
    </div>
  );
}

export default CheckIn;