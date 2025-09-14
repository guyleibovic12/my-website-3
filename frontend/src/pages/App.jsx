import React, { useState } from "react";
import api from "../api";

export default function App() {
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState({
    date: "date",
    store_id: "store_id",
    sku: "sku",
    qty: "qty",
    stock: "stock",
    age: "age",
    gender: "gender",
    family: "family",
    sole: "sole",
  });
  const [rows, setRows] = useState([]);

  const onUpload = async () => {
    if (!file) {
      alert("לא נבחר קובץ");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("date_col", mapping.date);
    fd.append("store_col", mapping.store_id);
    fd.append("sku_col", mapping.sku);
    fd.append("qty_col", mapping.qty);
    fd.append("stock_col", mapping.stock);
    fd.append("age_col", mapping.age);
    fd.append("gender_col", mapping.gender);
    fd.append("family_col", mapping.family);
    fd.append("sole_col", mapping.sole);

    try {
      const res = await api.post("/ingest", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRows(res.data.rows || []);
      alert(`קובץ נטען בהצלחה! סה"כ ${res.data.rows.length} שורות`);
    } catch (err) {
      console.error(err);
      alert("שגיאה בהעלאת קובץ");
    }
  };

  const onTrain = async () => {
    try {
      const res = await api.post("/train", { rows });
      if (res.data.error) {
        alert("שגיאה באימון: " + res.data.error);
        return;
      }
      const summary = res.data.summary;
      alert(
        `אימון הושלם ✅\nסה"כ מכירות: ${summary.total_sold}\nממוצע: ${summary.avg_sales.toFixed(
          2
        )}\nתחזית לעונה הבאה: ${summary.forecast_next_season}`
      );
    } catch (err) {
      console.error(err);
      alert("שגיאה באימון");
    }
  };

  return (
    <div className="container">
      <h1>תחזית מכירות</h1>

      <div className="card">
        <h3>העלאת נתונים</h3>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={onUpload}>העלה</button>
      </div>

      <div className="card">
        <h3>פעולות</h3>
        <button onClick={onTrain}>אימון מודלים</button>
      </div>

      <div className="card">
        <h3>שורות שהועלו</h3>
        <pre style={{ maxHeight: 200, overflow: "auto" }}>
          {JSON.stringify(rows.slice(0, 10), null, 2)}
        </pre>
        {rows.length > 10 && <p>... הוצגו 10 שורות ראשונות מתוך {rows.length}</p>}
      </div>
    </div>
  );
}
