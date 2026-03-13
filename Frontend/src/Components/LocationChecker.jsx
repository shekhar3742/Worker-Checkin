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

          const avgLat =
            readings.reduce((sum, r) => sum + r.latitude, 0) / 3;

          const avgLng =
            readings.reduce((sum, r) => sum + r.longitude, 0) / 3;

          const avgAccuracy =
            readings.reduce((sum, r) => sum + r.accuracy, 0) / 3;

          try {
            const response = await fetch(
              "https://worker-checkin.onrender.com/checkin",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  latitude: avgLat,
                  longitude: avgLng,
                  accuracy: avgAccuracy,
                }),
              }
            );

            const data = await response.json();

            setMessage(
              `${data.message} | Distance: ${data.distance.toFixed(
                2
              )} m`
            );
          } catch {
            setMessage("Server error");
          }
        }
      },
      () => {
        setMessage("Location permission denied");
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