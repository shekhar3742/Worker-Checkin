import { useState } from "react";

function CheckIn() {
  const [message, setMessage] = useState("");

  // function to get GPS location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 3000,
        }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      setMessage("Getting location...");

      // first reading
      let location = await getLocation();

      // retry if accuracy is poor
      if (location.accuracy > 25) {
        setMessage("Improving location accuracy...");
        location = await getLocation();
      }

      const { latitude, longitude, accuracy } = location;

      const response = await fetch(
        "http://localhost:5000/checkin",
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
        setMessage("❌ Location request timed out. Try again.");
      } else {
        setMessage("❌ Error getting location");
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