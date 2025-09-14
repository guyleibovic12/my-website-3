import React, { useState } from "react";
import api from "../api";

export default function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);

  // ברירת מחדל לשמות עמודות
  const [mapping] = useState({
    date_col: "date",
    store_col: "store_id",
    sku_col: "sku",
    qty_col: "qty",
    stock_col: "stock",
    age_col: "age",
    gender_col: "gender",
    family_col: "family",
    sole_col: "sole",
  });

  const onUpload = async () => {
    if (!file) {
      alert("לא נבחר קובץ");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file); // חייב להיות בשם file
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
        alert(`הקובץ נטען בהצלחה ✅ (${res.data.rows.length} שורות)`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("שגיאה בהעלאת קובץ 🚨");
    }
  };

  const onTrain = async () => {
    try {
      const res = await api.post("/train", { rows });
      if (res.data.error) {
        alert("שגיאה באימון: " + res.data.error);
      } else {
        const s = res.data.summary;
        alert(
          `אימון הושלם ✅\nסה"כ מכירות: ${s.total_sold}\nממוצע: ${s.avg_sales.toFixed(
            2
          )}\nתחזית לעונה הבאה: ${s.forecast_next_season}`
        );
      }
    } catch (err) {
      console.error("Train error:", err);
      alert("שגיאה באימון 🚨");
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
        <h3>פעולות</h3>
        <button onClick={onTrain}>אימון מודלים</button>
      </div>

      <div className="card">
        <h3>תצוגת נתונים</h3>
        <pre style={{ maxHeight: 250, overflow: "auto" }}>
          {JSON.stringify(rows.slice(0, 5), null, 2)}
        </pre>
        {rows.length > 5 && <p>... הוצגו 5 שורות ראשונות מתוך {rows.length}</p>}
      </div>
    </div>
  );
}
