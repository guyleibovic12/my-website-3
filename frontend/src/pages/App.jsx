import React, { useState } from "react";
import api from "../api";

export default function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  // מיפוי ברירת מחדל – חייב להתאים לקובץ
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

  const onTrain = async () => {
    try {
      const res = await api.post("/train", { rows });
      if (res.data.error) {
        alert("שגיאה באימון: " + res.data.error);
      } else {
        setSummary(res.data.summary);
        alert("אימון הושלם ✅");
      }
    } catch (err) {
      console.error("Train error:", err.response || err);
      alert("שגיאה באימון 🚨");
    }
  };

  const onForecast = () => {
    alert("📊 פונקציית תחזית תתווסף בהמשך");
  };

  const onPlan = () => {
    alert("📦 פונקציית תכנון עונה תתווסף בהמשך");
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
        <div className="row">
          <button onClick={onTrain}>אימון מודלים</button>
          <button className="secondary" onClick={onForecast}>תחזית</button>
          <button onClick={onPlan}>תכנון עונה</button>
        </div>
      </div>

      {summary && (
        <div className="card">
          <h3>סיכום אימון</h3>
          <ul>
            <li>סה"כ מכירות: {summary.total_sold}</li>
            <li>ממוצע מכירות: {summary.avg_sales.toFixed(2)}</li>
            <li>תחזית לעונה הבאה: {summary.forecast_next_season}</li>
          </ul>
        </div>
      )}

      <div className="card">
        <h3>תצוגת נתונים</h3>
        <pre style={{ maxHeight: 250, overflow: "auto" }}>
          {JSON.stringify(rows.slice(0, 5), null, 2)}
        </pre>
        {rows.length > 5 && <p>... הוצגו 5 מתוך {rows.length}</p>}
      </div>
    </div>
  );
}
