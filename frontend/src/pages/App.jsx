import React, { useState } from "react";
import api from "../api";

export default function App() {
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState([]);

  const checkConnection = async () => {
    try {
      const res = await api.get("/");
      setMessage("✅ חיבור לשרת עובד: " + res.data.message);
    } catch (err) {
      setMessage("❌ שגיאה: אין חיבור לשרת");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    // שמות עמודות לדוגמה
    formData.append("date_col", "date");
    formData.append("store_col", "store_id");
    formData.append("sku_col", "sku");
    formData.append("qty_col", "qty");
    formData.append("stock_col", "stock");
    formData.append("age_col", "age");
    formData.append("gender_col", "gender");
    formData.append("family_col", "family");
    formData.append("sole_col", "sole");

    try {
      const res = await api.post("/ingest", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRows(res.data.rows);
      setMessage("✅ קובץ הועלה בהצלחה! סה״כ " + res.data.rows.length + " רשומות");
    } catch (err) {
      console.error(err);
      setMessage("❌ שגיאה בהעלאת הקובץ");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>בדיקות מערכת</h1>

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

      <div style={{ marginTop: "20px" }}>
        <input type="file" onChange={handleUpload} />
      </div>

      <div style={{ fontSize: "20px", marginTop: "20px" }}>{message}</div>

      {rows.length > 0 && (
        <div style={{ marginTop: "30px", textAlign: "left" }}>
          <h3>🔹 רשומות ראשונות מהקובץ:</h3>
          <pre>{JSON.stringify(rows.slice(0, 5), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
