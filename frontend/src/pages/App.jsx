import React, { useState } from "react";
import api from "../api"; // הנתיב הזה לפי מה שהגדרת

export default function App() {
  const [message, setMessage] = useState("");

  const checkConnection = async () => {
    try {
      const res = await api.get("/");
      setMessage("✅ חיבור לשרת עובד: " + res.data.message);
    } catch (err) {
      setMessage("❌ שגיאה: אין חיבור לשרת");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>בדיקת חיבור</h1>
      <button
        onClick={checkConnection}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        בדוק חיבור ל־Backend
      </button>
      <div style={{ fontSize: "20px", marginTop: "20px" }}>{message}</div>
    </div>
  );
}
