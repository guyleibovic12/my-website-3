import React, { useState } from "react";
import api from "../api";

export default function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);

  // שים לב: חובה להגדיר שמות עמודות תואמים לקובץ שלך
  const mapping = {
    date_col: "date",
    store_col: "store_id",
    sku_col: "sku",
    qty_col: "qty",
    stock_col: "stock",
    age_col: "age",
    gender_col: "gender",
    family_col: "family",
    sole_col: "sole",
  };

  const onUpload = async () => {
    if (!file) {
      alert("לא נבחר קובץ");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file);

      // חובה לשלוח את כל השדות שה־backend דורש
      Object.entries(mapping).forEach(([key, value]) => {
        fd.append(key, value);
      });

      const res = await api.post("/ingest", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) {
        alert("שגיאה: " + res.data.error);
      } else {
        setRows(res.data.rows || []);
        alert(`קובץ נטען בהצלחה ✅ (${res.data.rows.length} שורות)`);
      }
    } catch (err) {
      console.error("Upload error:", err.response || err);
      alert("שגיאה בהעלאת קובץ 🚨");
    }
  };

  return (
    <div className="container">
      <h1>תחזית מכירות</h1>
      <div className="card">
        <h3>העלאת נתונים</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={onUpload}>העלה</button>
      </div>

      <div className="card">
        <h3>תצוגת נתונים</h3>
        <pre style={{ maxHeight: 250, overflow: "auto" }}>
          {JSON.stringify(rows.slice(0, 5), null, 2)}
        </pre>
      </div>
    </div>
  );
}
