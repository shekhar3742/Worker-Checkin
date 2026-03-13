import { useState } from "react";

function CheckIn() {
  const [message, setMessage] = useState("");

  const handleCheckIn = () => {
    setMessage("Getting location...");

    let readings = [];

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        readings.push(pos.coords);

        if (readings.length === 3) {
          navigator.geolocation.clearWatch(watchId);

          // Accuracy-weighted average
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
      },
      () => {
        setMessage("❌ Location permission denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 7000,
      }
    );
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